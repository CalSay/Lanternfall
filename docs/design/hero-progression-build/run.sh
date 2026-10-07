#!/bin/bash
# usage: run.sh <dir> <outdir> <label> <class> <persona> [extra args...]
dir=$1; out=$2; label=$3; cls=$4; per=$5; shift 5
cd $dir
if [ "$per" = good ]; then a="--days 17 --checkins 8,13,19 --session 60 --first 60 --skill good"; else a="--days 60 --checkins 8,13,19 --session 15 --first 15 --skill casual"; fi
node tools/sim.mjs $a --class $cls --active 1 --turns 1 --seed ${SEED:-41} --health $out/$label-$cls-$per${SEED:+-s$SEED}.json "$@" > $out/$label-$cls-$per${SEED:+-s$SEED}.txt 2>&1
echo "$label $cls $per ${SEED:-41} exit $?" >> $out/done.txt
