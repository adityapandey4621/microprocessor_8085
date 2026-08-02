"use client"

// Authentic industrial electronics sound synthesizer for "The Motherboard IS The Website"
class HardwareAudioSynth {
  private ctx: AudioContext | null = null
  public isMuted: boolean = false
  private humOsc: OscillatorNode | null = null
  private humGain: GainNode | null = null

  private initContext() {
    if (typeof window === "undefined") return
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume()
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopElectricalHum()
    }
    return this.isMuted
  }

  // Tactile physical switch click on the motherboard
  public playPowerSwitchClick() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(140, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.04)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  }

  // Low 60Hz electrical transformer & PCB resonance hum
  public startElectricalHum() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return
    if (this.humOsc) return // Already humming

    const now = this.ctx.currentTime
    this.humOsc = this.ctx.createOscillator()
    this.humGain = this.ctx.createGain()

    this.humOsc.type = "sine"
    this.humOsc.frequency.setValueAtTime(60, now) // 60Hz mains harmonic

    // Extremely subtle background hum
    this.humGain.gain.setValueAtTime(0.001, now)
    this.humGain.gain.linearRampToValueAtTime(0.018, now + 0.8)

    this.humOsc.connect(this.humGain)
    this.humGain.connect(this.ctx.destination)
    this.humOsc.start(now)
  }

  public stopElectricalHum() {
    if (!this.humOsc || !this.humGain || !this.ctx) return
    const now = this.ctx.currentTime
    this.humGain.gain.linearRampToValueAtTime(0.0001, now + 0.3)
    setTimeout(() => {
      try {
        this.humOsc?.stop()
        this.humOsc?.disconnect()
        this.humGain?.disconnect()
      } catch (e) {
        // ignore
      }
      this.humOsc = null
      this.humGain = null
    }, 320)
  }

  // Capacitor charging whine (subtle rising pitch)
  public playCapacitorCharge() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(1240, now + 0.45)

    gain.gain.setValueAtTime(0.04, now)
    gain.gain.linearRampToValueAtTime(0.08, now + 0.2)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.45)
  }

  // Quartz crystal oscillator tick (precision acoustic clicks)
  public playClockTick() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(3200, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.02)

    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.02)
  }

  // Precision robotic arm stepper motor servo whine
  public playRoboticServo() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(310, now)
    osc.frequency.linearRampToValueAtTime(180, now + 0.5)

    gain.gain.setValueAtTime(0.03, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  }

  // Satisfying metallic socket locking click
  public playSocketLockClick() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc1 = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc1.type = "triangle"
    osc1.frequency.setValueAtTime(900, now)
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.06)

    osc2.type = "square"
    osc2.frequency.setValueAtTime(320, now)
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.06)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(this.ctx.destination)
    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.06)
    osc2.stop(now + 0.06)
  }

  // Warm analog PCB boot chime when the entire motherboard awakens
  public playMotherboardBoot() {
    if (this.isMuted) return
    this.initContext()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const chords = [261.63, 329.63, 392.0, 523.25] // C Major analog chord
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2)
    gain.connect(this.ctx.destination)

    chords.forEach((freq, idx) => {
      if (!this.ctx) return
      const osc = this.ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, now + idx * 0.1)
      osc.connect(gain)
      osc.start(now + idx * 0.1)
      osc.stop(now + 2.2)
    })
  }

  // Alias methods for compatibility with any existing components
  public playHoverSynth() {
    this.playClockTick()
  }
  public playRegisterTick() {
    this.playClockTick()
  }
  public playRelayClick() {
    this.playPowerSwitchClick()
  }
  public playMemoryPing() {
    this.playClockTick()
  }
}

export const hardwareAudio = new HardwareAudioSynth()
// Alias for compatibility with any remaining references
export const cpuSound = hardwareAudio
