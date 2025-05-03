export interface ScrobblerLog {
  artist: string;
  album?: string;
  title: string;
  trackNum?: number;
  length: number;
  rating: 'L' | 'S';
  timestamp: number;
  musicBrainzTrackId?: string;
}
