"""Moteur de mise à jour : exécute les étapes déclarées dans le registre (run.py).

Chaque étape déclare :
  id        identifiant court (clé de version dans sources.json)
  run       fonction (st, ctx) ; ctx donne accès aux résultats partagés (ctx['ban']) et à ctx['done'](*clés)
  cadence   'always' (chaque exécution), 'full' (reconstruction complète seulement),
            un nombre de jours (recalcul si la dernière extraction est plus ancienne, et en reconstruction complète),
            ou None (seulement quand la version change)
  version   entier ; l'augmenter force un recalcul unique de l'étape à la prochaine exécution
  dates     clés de sources.json datées du jour quand l'étape réussit (la première sert à mesurer l'âge)
  critical  True : un échec arrête la mise à jour (rien n'est publié)
  streams   {flux: type} produits par bâtiment (repris du site précédent, ou mis à zéro, en cas d'échec)
  arr       {clé: 'b' (par bâtiment) ou 'g' (globale)} écrites dans les arr_XX
  files     fichiers publiés produits (repris du site précédent s'ils manquent après l'étape)
  force     fonction (st) -> bool : recalcul nécessaire malgré la cadence (donnée absente, etc.)
  rebuild   True : l'étape redéfinit la liste des bâtiments ; elle ne tourne qu'en reconstruction complète,
            même si sa version change (la version est alors prise en compte à la prochaine reconstruction complète)

Pour ajouter un jeu de données : écrire un module step_xxx.py avec une fonction run(st, ...),
puis une ligne Step(...) dans le registre de run.py.
"""
import datetime, os
import numpy as np
from core import log

class Step:
    def __init__(self, id, run, cadence='full', version=1, dates=(), critical=False, streams=None, arr=None, files=(), force=None, label=None, rebuild=False):
        self.id, self.run, self.cadence, self.version = id, run, cadence, version
        self.dates, self.critical = list(dates), critical
        self.streams, self.arr, self.files = dict(streams or {}), dict(arr or {}), list(files)
        self.force, self.label, self.rebuild = force, label or id, rebuild

def warn(title, msg):
    print('::warning title=%s::%s' % (title, str(msg)[:300].replace('\n', ' ')), flush=True)

class Engine:
    def __init__(self, mode, st, prev, site, SD, today):
        self.mode, self.st, self.prev, self.site, self.SD, self.today = mode, st, prev, site, SD, today
        self.V = SD.setdefault('_v', {})
        self.ctx = {'done': self.done}

    def done(self, *keys):
        for k in keys: self.SD[k] = self.today

    def age(self, s):
        k = s.dates[0] if s.dates else None
        if not k: return 10 ** 6
        try: return (datetime.date.fromisoformat(self.today) - datetime.date.fromisoformat(self.SD.get(k, '2000-01-01'))).days
        except ValueError: return 10 ** 6

    def due(self, s):
        if s.rebuild and self.mode != 'full': return None
        if int(self.V.get(s.id, 0)) < s.version: return 'version %d' % s.version
        if s.force and s.force(self.st): return 'donnée absente'
        c = s.cadence
        if c == 'always': return 'chaque exécution'
        if self.mode == 'full' and c is not None: return 'reconstruction complète'
        if isinstance(c, (int, float)) and self.age(s) > c: return 'dernière extraction il y a %d jours' % self.age(s)
        return None

    def same_geometry(self):
        p, st = self.prev, self.st
        if p is None or p.N != st.N: return False
        return all(k in p.S and k in st.S and len(p.s(k)) == len(st.s(k)) and np.array_equal(p.s(k), st.s(k)) for k in ('nr', 'rl', 'ab'))

    def restore(self, s):
        """Reprend les sorties de l'étape depuis le site précédent (ou les met à zéro si les bâtiments ont changé)."""
        st, p = self.st, self.prev; same = self.same_geometry()
        for k, t in s.streams.items():
            if same and k in p.S: st.put(k, p.s(k), t)
            elif k not in st.S or len(st.s(k)) != st.N: st.zero(k, t)
        for k, kind in s.arr.items():
            for a in range(21):
                if p is not None and (kind == 'g' or same) and k in p.arr.get(a, {}): st.arr.setdefault(a, {})[k] = p.arr[a][k]
                elif kind == 'b': st.arr.setdefault(a, {}).setdefault(k, {})
        self.restore_files(s)

    def restore_files(self, s):
        for f in s.files:
            if f not in self.st.files and self.site and os.path.exists(os.path.join(self.site, f)):
                self.st.files[f] = open(os.path.join(self.site, f), 'rb').read(); log('  repris du site précédent :', f)

    def run(self, steps):
        for s in steps:
            why = self.due(s)
            if not why: log('— %s : à jour' % s.label); continue
            log('— %s (%s)' % (s.label, why))
            try:
                r = s.run(self.st, self.ctx)
            except Exception as e:
                if s.critical: raise
                warn('%s non mis à jour' % s.label, e); self.restore(s); continue
            for e in (r if isinstance(r, list) else []): warn('%s incomplet' % s.label, e)
            self.restore_files(s)        # parties en échec d'une étape à plusieurs sources
            self.done(*s.dates); self.V[s.id] = s.version
