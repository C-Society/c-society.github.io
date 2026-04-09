export const VoiceService = {
  _currentAudio: null,
  _currentSessionId: 0,

  stop() {
    this._currentSessionId++; // Incrementing the ID invalidates previous loops
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      this._currentAudio = null;
    }
  },

  /**
   * Chunks text into sentences, plays the first chunk, and concurrently fetches the next. 
   * This streams audio sequentially to completely avoid Coqui latency and intonation degradation.
   */
  async playStream(text, onPlayStarted, onFinish) {
    this.stop();
    const sessionId = this._currentSessionId;

    if (!text) {
      if (onFinish) onFinish();
      return;
    }

    // Split text by punctuation into full sentences.
    // Larger chunks allow the AI to maintain better natural intonation and prosody.
    let chunks = text.match(/[^.!?]+[.!?]+/g);
    if (!chunks || chunks.length === 0) {
      chunks = [text];
    } else {
      const lastPunc = text.lastIndexOf(chunks[chunks.length-1]);
      if (lastPunc + chunks[chunks.length-1].length < text.length) {
        chunks.push(text.substring(lastPunc + chunks[chunks.length-1].length));
      }
    }
    
    chunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

    let nextAudioPromise = this.generateSpeech(chunks[0]);
    let firstPlayed = false;

    for (let i = 0; i < chunks.length; i++) {
        // If session ID changed, a new playStream was called. Kill this loop.
        if (this._currentSessionId !== sessionId) break;

        const currentUrl = await nextAudioPromise;
        
        if (this._currentSessionId !== sessionId) break;

        // Start pre-fetching the next chunk immediately
        if (i + 1 < chunks.length) {
             nextAudioPromise = this.generateSpeech(chunks[i+1]);
        }

        if (currentUrl) {
             const audio = new Audio(currentUrl);
             this._currentAudio = audio;
             
             await new Promise((resolve) => {
                 audio.onended = () => {
                     URL.revokeObjectURL(currentUrl);
                     resolve();
                 };
                 audio.onerror = () => resolve();
                 
                 audio.play().then(() => {
                     if (!firstPlayed) {
                         firstPlayed = true;
                         if (onPlayStarted) onPlayStarted();
                     }
                 }).catch(e => {
                     resolve();
                 });
             });
        } else {
             // Fallback
             this.stop();
             if (onPlayStarted) onPlayStarted(); 
             
             if (!('speechSynthesis' in window)) {
                if (onFinish) onFinish();
                return;
             }
             
             const utterance = new SpeechSynthesisUtterance(text);
             const voices = window.speechSynthesis.getVoices();
             const britishMale = voices.find(v => v.lang.includes('en-GB') && v.name.includes('Male'));
             if (britishMale) utterance.voice = britishMale;

             utterance.onend = () => { if (onFinish) onFinish(); };
             utterance.onerror = () => { if (onFinish) onFinish(); };
             window.speechSynthesis.speak(utterance);
             return; 
        }
    }
    
    if (onFinish && this._currentSessionId === sessionId) {
        onFinish();
    }
  },

  async generateSpeech(text) {
    if (!text) return null;
    try {
      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        let errStr = await response.text();
        console.warn("Local TTS Server returned an error:", response.status, errStr);
        return null;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Could not reach local TTS server.", e);
      return null;
    }
  }
};
