import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, ChevronDown, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

interface Song {
  name: string;
  url: string;
  filename: string;
}

const MusicPlayer: React.FC = () => {
  const { t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playerRef.current && !playerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/music');
      const data = await response.json();
      setSongs(data);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSongIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSong = songs[currentSongIndex];

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={playerRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-brand-card border border-brand-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center gap-2 text-brand-muted transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">{t('music.nowPlaying')}</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-brand-muted hover:text-brand-text transition-colors"
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <div className="aspect-square mb-6 rounded-2xl bg-brand-text/5 flex items-center justify-center relative overflow-hidden group">
                {currentSong ? (
                  <Music2 size={80} className="text-brand-text/10 group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Music size={80} className="text-brand-text/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold truncate text-brand-text">
                  {currentSong ? currentSong.name : t('music.noSong')}
                </h3>
                <p className="text-xs text-brand-muted font-medium mt-1">
                  {currentSong ? t('music.localMusic') : t('music.hint')}
                </p>
              </div>

              {currentSong && (
                <>
                  <div className="mb-6">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={progress}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-brand-text/10 rounded-full appearance-none cursor-pointer accent-brand-text"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-mono text-brand-muted">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <button onClick={prevSong} className="text-brand-muted hover:text-brand-text transition-colors">
                      <SkipBack size={24} />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-14 h-14 bg-brand-text text-brand-bg rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                    >
                      {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </button>
                    <button onClick={nextSong} className="text-brand-muted hover:text-brand-text transition-colors">
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 size={16} className="text-brand-muted" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-grow h-1 bg-brand-text/10 rounded-full appearance-none cursor-pointer accent-brand-text"
                    />
                  </div>
                </>
              )}

              {!currentSong && songs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-brand-muted italic">
                    {t('music.emptyHint')}
                  </p>
                  <button 
                    onClick={fetchSongs}
                    className="mt-4 text-[10px] font-bold tracking-widest uppercase px-4 py-2 border border-brand-border rounded-full hover:bg-brand-text/5 transition-colors"
                  >
                    {t('music.refresh')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-bg border border-brand-border rounded-full flex items-center justify-center shadow-2xl hover:shadow-brand-text/10 transition-shadow group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-brand-text/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Music size={24} className={isPlaying ? "animate-bounce text-brand-text" : "text-brand-text"} />
      </motion.button>

      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={nextSong}
        />
      )}
    </div>
  );
};

export default MusicPlayer;
