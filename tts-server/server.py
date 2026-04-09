import os
import torch
import warnings

# --- PyTorch 2.6+ Compatibility Fix ---
# PyTorch 2.6 made weights_only=True the default, which breaks Coqui TTS model loading.
# This forces it back to False dynamically.
_original_load = torch.load
def _patched_load(*args, **kwargs):
    kwargs["weights_only"] = False
    return _original_load(*args, **kwargs)
torch.load = _patched_load
# --------------------------------------
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from TTS.api import TTS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str

print("Loading Coqui TTS model... (This may take a minute on first run)")
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
try:
    tts = TTS(model_name).to(device)
    print(f"Model successfully loaded onto {device}")
except Exception as e:
    print("Failed to load model:", e)
    tts = None

@app.post("/api/tts")
async def generate_speech(request: TTSRequest):
    if tts is None:
        raise HTTPException(status_code=500, detail="TTS Model is not loaded.")
    
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided")
        
    reference_wav_path = "reference.wav"
    if not os.path.exists(reference_wav_path):
        raise HTTPException(status_code=404, detail="reference.wav not found. Please place a reference.wav in the tts-server folder.")
        
    try:
        # Use XTTS to generate the raw audio waveform
        wav = tts.tts(
            text=text,
            speaker_wav=reference_wav_path,
            language="en"
        )
        
        import numpy as np
        import librosa
        import io
        import soundfile as sf
        
        # Convert to numpy array for processing
        wav_np = np.array(wav, dtype=np.float32)
        
        # Normalize the audio for a "bold" feel without the robotic artifacts of pitch shifting
        max_val = np.abs(wav_np).max()
        if max_val > 0:
            wav_norm = wav_np / max_val
        else:
            wav_norm = wav_np
            
        # Boost volume slightly but keep it clean
        wav_final = np.clip(wav_norm * 0.95, -1.0, 1.0)
        
        # Cleanly convert to WAV bytes in memory without touching disk
        out_io = io.BytesIO()
        sf.write(out_io, wav_bold, 24000, format='WAV', subtype='PCM_16')
        audio_bytes = out_io.getvalue()
            
        return Response(content=audio_bytes, media_type="audio/wav")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
