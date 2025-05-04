<template>
  <div class="flex items-center h-screen justify-center gap-4 p-4">
    <div class="flex flex-col flex-1/4 h-full items-center gap-4">
      <div class="h-16 w-full flex items-center justify-center rounded-lg">
        <span class="font-semibold text-2xl">Rockbox Last.fm Scrobbler</span>
      </div>

      <div class="w-full border border-(--p-surface-800) rounded-lg p-4 bg-(--p-surface-900)">
        <FileUpload mode="basic" accept=".log" @select="handleUpload" />
      </div>
    </div>

    <div class="flex flex-3/4 h-full items-center border border-(--p-surface-800) rounded-lg bg-(--p-surface-900)">
      <DataTable
        class="h-full w-full rounded-lg p-2"
        scrollable
        scrollHeight="flex"
        :value="logData"
        paginator
        :rows="25"
        :rowsPerPageOptions="[10, 25, 50, 100]"
      >
        <Column field="artist" header="Artist" />
        <Column field="album" header="Album" />
        <Column field="title" header="Title" />
        <Column field="trackNum" header="Track #" />
        <Column field="length" header="Length">
          <template #body="slotProps">
            {{ convertLength(slotProps.data.length) }}
          </template>
        </Column>
        <Column field="rating" header="Rating">
          <template #body="slotProps">
            <Tag :value="slotProps.data.rating === 'L' ? 'Listened' : 'Skipped'" :severity="getSeverity(slotProps.data.rating)" />
          </template>
        </Column>
        <Column field="timestamp" header="Timestamp">
          <template #body="slotProps">
            {{ convertUnixToLocalTime(slotProps.data.timestamp) }}
          </template>
        </Column>
        <Column>
          <template #body="slotProps">
            <Button icon="pi pi-times" severity="danger" variant="text" rounded @click="handleRemoveLog(slotProps.index)"></Button>
          </template>
        </Column>

        <template #empty>
          <div class="h-full w-full flex items-center justify-center">
            Upload a &nbsp;<span class="font-mono bg-(--p-surface-700) py-0.5 px-1 rounded">.scobbler.log</span>&nbsp; file for upload.
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScrobblerLog } from '@/types';
import { Button, Column, DataTable, FileUpload, Tag, type FileUploadSelectEvent } from 'primevue';
import { onMounted, ref } from 'vue';

// Types ------------------------------------------------------------------------------

// Component Info (props/emits) -------------------------------------------------------

// Template Refs ----------------------------------------------------------------------

// Variables --------------------------------------------------------------------------

// Reactive Variables -----------------------------------------------------------------
const logData = ref<ScrobblerLog[]>([]);

// Provided ---------------------------------------------------------------------------

// Exposed ----------------------------------------------------------------------------

// Injections -------------------------------------------------------------------------

// Watchers ---------------------------------------------------------------------------

// Methods ----------------------------------------------------------------------------
const parseLogFile = async (file: Blob): Promise<ScrobblerLog[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const lines = result.split(/\r?\n/);

      if (lines[0] !== '#AUDIOSCROBBLER/1.1') {
        console.warn('File not of correct type.');
        return;
      }

      const scrobblerLog: ScrobblerLog[] = [];

      for (const line of lines) {
        if (line.charAt(0) === '#') continue;

        const splitLine = line.split('\t');
        if (splitLine.length < 8) continue;

        scrobblerLog.push({
          artist: splitLine[0],
          album: splitLine[1],
          title: splitLine[2],
          trackNum: +splitLine[3],
          length: +splitLine[4],
          rating: splitLine[5] as 'L' | 'S',
          timestamp: +splitLine[6],
          musicBrainzTrackId: splitLine[7]
        });
      }

      resolve(scrobblerLog);
    };

    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

const handleUpload = async (event: FileUploadSelectEvent) => {
  const scrobblerLog = await parseLogFile(event.files[0]);
  logData.value = scrobblerLog;
};

const getSeverity = (rating: ScrobblerLog['rating']) => {
  return rating === 'L' ? 'success' : 'warn';
};

const convertLength = (length: number): string => {
  const hours = Math.floor(length / 3600);
  const minutes = Math.floor((length % 3600) / 60);
  const seconds = length % 60;

  const padded = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${padded(minutes)}:${padded(seconds)}`;
  } else {
    return `${minutes}:${padded(seconds)}`;
  }
};

const convertUnixToLocalTime = (naiveUnixTime: number) => {
  const localOffsetMinutes = new Date().getTimezoneOffset();
  const realTime = naiveUnixTime + localOffsetMinutes * 60;
  const date = new Date(realTime * 1000);
  return date.toLocaleString();
};

const handleRemoveLog = (i: number) => {
  logData.value.splice(i, 1);
};

// Lifecycle Hooks --------------------------------------------------------------------
// onMounted(async () => {
//   const res = await fetch('/.scrobbler.log');
//   logData.value = await parseLogFile(await res.blob());
// });
</script>
