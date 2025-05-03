<template>
  <div class="flex items-center h-[100vh] justify-center">
    <Button label="Submit" />
  </div>
</template>

<script setup lang="ts">
import type { ScrobblerLog } from '@/types';
import { Button } from 'primevue';
import { onMounted, ref } from 'vue';

const lines = ref<string[]>([]);

onMounted(async () => {
  const res = await fetch('/.scrobbler.log');

  const scrobblerLog: ScrobblerLog[] = [];

  const reader = new FileReader();
  reader.onload = () => {
    lines.value = (reader.result as string)?.split(/\r?\n/);

    if (lines.value[0] !== '#AUDIOSCROBBLER/1.1') {
      console.log('File not of correct type.');
    }

    lines.value.forEach((line) => {
      if (line.charAt(0) === '#') return;

      const splitLine = line.split('\t');

      const log: ScrobblerLog = {
        artist: splitLine[0],
        album: splitLine[1],
        title: splitLine[2],
        trackNum: +splitLine[3],
        length: +splitLine[4],
        rating: splitLine[5] as 'L' | 'S',
        timestamp: +splitLine[6],
        musicBrainzTrackId: splitLine[7]
      };

      scrobblerLog.push(log);
    });

    console.log(scrobblerLog);
  };
  reader.readAsText(await res.blob());
});
</script>
