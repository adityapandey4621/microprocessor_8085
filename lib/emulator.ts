// 8085 Microprocessor Emulator Logic

export interface Registers {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  H: number;
  L: number;
  PC: number; // Program Counter
  SP: number; // Stack Pointer
}

export interface Flags {
  Z: number;  // Zero Flag
  S: number;  // Sign Flag
  P: number;  // Parity Flag
  CY: number; // Carry Flag
  AC: number; // Auxiliary Carry Flag
}

export interface State {
  registers: Registers;
  flags: Flags;
  memory: Uint8Array;
  ioPorts: Map<number, number>;
  halted: boolean;
  clockCycles: number;
  interruptsEnabled: boolean;
  interruptMask: number; // Bit 0: Mask 5.5, Bit 1: Mask 6.5, Bit 2: Mask 7.5, Bit 3: MSE, Bit 4: Reset 7.5
  pendingInterrupts: number; // Bit 0: RST 5.5, Bit 1: RST 6.5, Bit 2: RST 7.5, Bit 3: TRAP, Bit 4: INTR
  serialOutput: number; // SOD bit
  serialInput: number; // SID bit
  instructionsExecuted: number;
  memoryReads: number;
  memoryWrites: number;
  stackOps: number;
  lastMemoryAccess: number | null;
}

export type ExecutionEvent = any;
export type ExecutionEventListener = any;

export class Emulator8085 {
  private state: State;
  private breakpoints: Set<number> = new Set();

  constructor() {
    this.state = {
      registers: {
        A: 0, B: 0, C: 0, D: 0, E: 0, H: 0, L: 0,
        PC: 0x0000, SP: 0xFFFF,
      },
      flags: {
        Z: 0, S: 0, P: 0, CY: 0, AC: 0,
      },
      memory: new Uint8Array(0x10000), // 64KB memory
      ioPorts: new Map<number, number>(),
      halted: false,
      clockCycles: 0,
      interruptsEnabled: false,
      interruptMask: 0x07, // All masked by default
      pendingInterrupts: 0,
      serialOutput: 0,
      serialInput: 0,
      instructionsExecuted: 0,
      memoryReads: 0,
      memoryWrites: 0,
      stackOps: 0,
      lastMemoryAccess: null,
    };

    // Initialize memory
    this.state.memory.fill(0);
  }

  getState(): State {
    return { 
      ...this.state,
      registers: { ...this.state.registers },
      flags: { ...this.state.flags },
      memory: new Uint8Array(this.state.memory),
      ioPorts: new Map(this.state.ioPorts)
    };
  }

  setState(newState: State): void {
    this.state = {
      ...newState,
      registers: { ...newState.registers },
      flags: { ...newState.flags },
      memory: new Uint8Array(newState.memory),
      ioPorts: new Map(newState.ioPorts)
    };
  }

  public clearBreakpoints() {
    this.breakpoints.clear();
  }

  public addEventListener(...args: any[]) {
    // Stub for trace-engine event listener
  }

  public reset(): void {
    this.state.registers = {
      A: 0, B: 0, C: 0, D: 0, E: 0, H: 0, L: 0,
      PC: 0x0000, SP: 0xFFFF,
    };
    this.state.flags = {
      Z: 0, S: 0, P: 0, CY: 0, AC: 0,
    };
    this.state.halted = false;
    this.state.clockCycles = 0;
    this.state.interruptsEnabled = false;
    this.state.interruptMask = 0x07;
    this.state.pendingInterrupts = 0;
    this.state.serialOutput = 0;
    this.state.serialInput = 0;
    this.state.instructionsExecuted = 0;
    this.state.memoryReads = 0;
    this.state.memoryWrites = 0;
    this.state.stackOps = 0;
    this.state.lastMemoryAccess = null;
    this.state.memory.fill(0);
    this.state.ioPorts.clear();
  }

  setBreakpoint(address: number): void {
    this.breakpoints.add(address);
  }

  removeBreakpoint(address: number): void {
    this.breakpoints.delete(address);
  }

  hasBreakpoint(): boolean {
    return this.breakpoints.has(this.state.registers.PC);
  }

  triggerHardwareInterrupt(type: 'TRAP' | 'RST7.5' | 'RST6.5' | 'RST5.5' | 'INTR'): void {
    switch (type) {
      case 'TRAP': this.state.pendingInterrupts |= 0x08; break;
      case 'RST7.5': this.state.pendingInterrupts |= 0x04; break;
      case 'RST6.5': this.state.pendingInterrupts |= 0x02; break;
      case 'RST5.5': this.state.pendingInterrupts |= 0x01; break;
      case 'INTR': this.state.pendingInterrupts |= 0x10; break;
    }
  }

  setSerialInput(bit: number): void {
    this.state.serialInput = bit ? 1 : 0;
  }

  getRegisterPair(rp: 'B' | 'D' | 'H' | 'SP'): number {
    switch (rp) {
      case 'B': return (this.state.registers.B << 8) | this.state.registers.C;
      case 'D': return (this.state.registers.D << 8) | this.state.registers.E;
      case 'H': return (this.state.registers.H << 8) | this.state.registers.L;
      case 'SP': return this.state.registers.SP;
      default: return 0;
    }
  }

  setRegisterPair(rp: 'B' | 'D' | 'H' | 'SP', value: number): void {
    const val = value & 0xFFFF;
    switch (rp) {
      case 'B':
        this.state.registers.B = (val >> 8) & 0xFF;
        this.state.registers.C = val & 0xFF;
        break;
      case 'D':
        this.state.registers.D = (val >> 8) & 0xFF;
        this.state.registers.E = val & 0xFF;
        break;
      case 'H':
        this.state.registers.H = (val >> 8) & 0xFF;
        this.state.registers.L = val & 0xFF;
        break;
      case 'SP':
        this.state.registers.SP = val;
        break;
    }
  }

  updateFlags(result: number, ac: number = 0): void {
    result &= 0xFF;
    this.state.flags.Z = result === 0 ? 1 : 0;
    this.state.flags.S = (result & 0x80) !== 0 ? 1 : 0;
    this.state.flags.P = this.calculateParity(result);
    this.state.flags.AC = ac;
  }

  calculateParity(value: number): number {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      if ((value >> i) & 1) count++;
    }
    return (count % 2 === 0) ? 1 : 0;
  }

  getMemory(address: number): number {
    this.state.memoryReads++;
    this.state.lastMemoryAccess = address;
    return this.state.memory[address & 0xFFFF];
  }

  setMemory(address: number, value: number): void {
    this.state.memoryWrites++;
    this.state.lastMemoryAccess = address;
    this.state.memory[address & 0xFFFF] = value & 0xFF;
  }

  getPort(port: number): number {
    return this.state.ioPorts.get(port) || 0;
  }

  setPort(port: number, value: number): void {
    this.state.ioPorts.set(port, value & 0xFF);
  }

  push(value: number): void {
    this.state.stackOps++;
    const sp = (this.state.registers.SP - 1) & 0xFFFF;
    this.state.registers.SP = sp;
    this.setMemory(sp, (value >> 8) & 0xFF);

    const sp2 = (sp - 1) & 0xFFFF;
    this.state.registers.SP = sp2;
    this.setMemory(sp2, value & 0xFF);
  }

  pop(): number {
    this.state.stackOps++;
    const sp = this.state.registers.SP;
    const low = this.getMemory(sp);
    const high = this.getMemory(sp + 1);
    this.state.registers.SP = (sp + 2) & 0xFFFF;
    return (high << 8) | low;
  }

  private add8Bit(value: number): number {
    const result = this.state.registers.A + value;
    const ac = ((this.state.registers.A & 0x0F) + (value & 0x0F)) > 0x0F ? 1 : 0;
    this.state.flags.CY = result > 0xFF ? 1 : 0;
    this.state.registers.A = result & 0xFF;
    this.updateFlags(this.state.registers.A, ac);
    return result & 0xFF;
  }

  private sub8Bit(value: number): number {
    const result = this.state.registers.A - value;
    const ac = ((this.state.registers.A & 0x0F) - (value & 0x0F)) < 0 ? 1 : 0;
    this.state.flags.CY = result < 0 ? 1 : 0;
    this.state.registers.A = result & 0xFF;
    this.updateFlags(this.state.registers.A, ac);
    return result & 0xFF;
  }

  private and8Bit(value: number): number {
    const result = this.state.registers.A & value;
    this.state.flags.CY = 0;
    this.state.flags.AC = 1; // 8085 specific: logical AND sets AC to 1
    this.state.registers.A = result & 0xFF;
    this.updateFlags(this.state.registers.A, 1);
    return result & 0xFF;
  }

  private or8Bit(value: number): number {
    const result = this.state.registers.A | value;
    this.state.flags.CY = 0;
    this.state.flags.AC = 0;
    this.state.registers.A = result & 0xFF;
    this.updateFlags(this.state.registers.A, 0);
    return result & 0xFF;
  }

  private xor8Bit(value: number): number {
    const result = this.state.registers.A ^ value;
    this.state.flags.CY = 0;
    this.state.flags.AC = 0;
    this.state.registers.A = result & 0xFF;
    this.updateFlags(this.state.registers.A, 0);
    return result & 0xFF;
  }

  private checkInterrupts(): number {
    // Priority: TRAP > RST 7.5 > RST 6.5 > RST 5.5 > INTR

    // TRAP (Non-maskable)
    if (this.state.pendingInterrupts & 0x08) {
      this.state.pendingInterrupts &= ~0x08; // Clear TRAP
      this.state.interruptsEnabled = false; // Disable interrupts
      this.push(this.state.registers.PC);
      this.state.registers.PC = 0x0024;
      return 12; // Cycles for interrupt
    }

    if (!this.state.interruptsEnabled) return 0;

    // RST 7.5
    if ((this.state.pendingInterrupts & 0x04) && !(this.state.interruptMask & 0x04)) {
      this.state.pendingInterrupts &= ~0x04; // Clear RST 7.5
      this.state.interruptsEnabled = false;
      this.push(this.state.registers.PC);
      this.state.registers.PC = 0x003C;
      return 12;
    }

    // RST 6.5
    if ((this.state.pendingInterrupts & 0x02) && !(this.state.interruptMask & 0x02)) {
      // Level triggered, don't clear pending automatically unless handled
      this.state.interruptsEnabled = false;
      this.push(this.state.registers.PC);
      this.state.registers.PC = 0x0034;
      return 12;
    }

    // RST 5.5
    if ((this.state.pendingInterrupts & 0x01) && !(this.state.interruptMask & 0x01)) {
      this.state.interruptsEnabled = false;
      this.push(this.state.registers.PC);
      this.state.registers.PC = 0x002C;
      return 12;
    }

    // INTR
    if (this.state.pendingInterrupts & 0x10) {
      this.state.interruptsEnabled = false;
      // INTR requires external opcode. For simulation, we'll assume RST 7 (0xFF) or similar.
      // But standard behavior is to fetch instruction from data bus.
      // We'll simulate it as RST 7 for now.
      this.push(this.state.registers.PC);
      this.state.registers.PC = 0x0038;
      return 12;
    }

    return 0;
  }

  step(): number {
    if (this.state.halted) return 0;

    // Check for interrupts before fetching instruction
    const interruptCycles = this.checkInterrupts();
    if (interruptCycles > 0) {
      this.state.clockCycles += interruptCycles;
      return interruptCycles;
    }

    const opcode = this.getMemory(this.state.registers.PC);
    let cycles = 0;

    this.state.registers.PC = (this.state.registers.PC + 1) & 0xFFFF;
    this.state.instructionsExecuted++;

    switch (opcode) {
      // MOV Instructions
      case 0x7F: cycles = 5; break; // MOV A,A
      case 0x78: this.state.registers.A = this.state.registers.B; cycles = 5; break;
      case 0x79: this.state.registers.A = this.state.registers.C; cycles = 5; break;
      case 0x7A: this.state.registers.A = this.state.registers.D; cycles = 5; break;
      case 0x7B: this.state.registers.A = this.state.registers.E; cycles = 5; break;
      case 0x7C: this.state.registers.A = this.state.registers.H; cycles = 5; break;
      case 0x7D: this.state.registers.A = this.state.registers.L; cycles = 5; break;
      case 0x7E: this.state.registers.A = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x47: this.state.registers.B = this.state.registers.A; cycles = 5; break;
      case 0x40: cycles = 5; break; // MOV B,B
      case 0x41: this.state.registers.B = this.state.registers.C; cycles = 5; break;
      case 0x42: this.state.registers.B = this.state.registers.D; cycles = 5; break;
      case 0x43: this.state.registers.B = this.state.registers.E; cycles = 5; break;
      case 0x44: this.state.registers.B = this.state.registers.H; cycles = 5; break;
      case 0x45: this.state.registers.B = this.state.registers.L; cycles = 5; break;
      case 0x46: this.state.registers.B = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x4F: this.state.registers.C = this.state.registers.A; cycles = 5; break;
      case 0x48: this.state.registers.C = this.state.registers.B; cycles = 5; break;
      case 0x49: cycles = 5; break; // MOV C,C
      case 0x4A: this.state.registers.C = this.state.registers.D; cycles = 5; break;
      case 0x4B: this.state.registers.C = this.state.registers.E; cycles = 5; break;
      case 0x4C: this.state.registers.C = this.state.registers.H; cycles = 5; break;
      case 0x4D: this.state.registers.C = this.state.registers.L; cycles = 5; break;
      case 0x4E: this.state.registers.C = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x57: this.state.registers.D = this.state.registers.A; cycles = 5; break;
      case 0x50: this.state.registers.D = this.state.registers.B; cycles = 5; break;
      case 0x51: this.state.registers.D = this.state.registers.C; cycles = 5; break;
      case 0x52: cycles = 5; break; // MOV D,D
      case 0x53: this.state.registers.D = this.state.registers.E; cycles = 5; break;
      case 0x54: this.state.registers.D = this.state.registers.H; cycles = 5; break;
      case 0x55: this.state.registers.D = this.state.registers.L; cycles = 5; break;
      case 0x56: this.state.registers.D = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x5F: this.state.registers.E = this.state.registers.A; cycles = 5; break;
      case 0x58: this.state.registers.E = this.state.registers.B; cycles = 5; break;
      case 0x59: this.state.registers.E = this.state.registers.C; cycles = 5; break;
      case 0x5A: this.state.registers.E = this.state.registers.D; cycles = 5; break;
      case 0x5B: cycles = 5; break; // MOV E,E
      case 0x5C: this.state.registers.E = this.state.registers.H; cycles = 5; break;
      case 0x5D: this.state.registers.E = this.state.registers.L; cycles = 5; break;
      case 0x5E: this.state.registers.E = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x67: this.state.registers.H = this.state.registers.A; cycles = 5; break;
      case 0x60: this.state.registers.H = this.state.registers.B; cycles = 5; break;
      case 0x61: this.state.registers.H = this.state.registers.C; cycles = 5; break;
      case 0x62: this.state.registers.H = this.state.registers.D; cycles = 5; break;
      case 0x63: this.state.registers.H = this.state.registers.E; cycles = 5; break;
      case 0x64: cycles = 5; break; // MOV H,H
      case 0x65: this.state.registers.H = this.state.registers.L; cycles = 5; break;
      case 0x66: this.state.registers.H = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x6F: this.state.registers.L = this.state.registers.A; cycles = 5; break;
      case 0x68: this.state.registers.L = this.state.registers.B; cycles = 5; break;
      case 0x69: this.state.registers.L = this.state.registers.C; cycles = 5; break;
      case 0x6A: this.state.registers.L = this.state.registers.D; cycles = 5; break;
      case 0x6B: this.state.registers.L = this.state.registers.E; cycles = 5; break;
      case 0x6C: this.state.registers.L = this.state.registers.H; cycles = 5; break;
      case 0x6D: cycles = 5; break; // MOV L,L
      case 0x6E: this.state.registers.L = this.getMemory(this.getRegisterPair('H')); cycles = 7; break;

      case 0x77: this.setMemory(this.getRegisterPair('H'), this.state.registers.A); cycles = 7; break;
      case 0x70: this.setMemory(this.getRegisterPair('H'), this.state.registers.B); cycles = 7; break;
      case 0x71: this.setMemory(this.getRegisterPair('H'), this.state.registers.C); cycles = 7; break;
      case 0x72: this.setMemory(this.getRegisterPair('H'), this.state.registers.D); cycles = 7; break;
      case 0x73: this.setMemory(this.getRegisterPair('H'), this.state.registers.E); cycles = 7; break;
      case 0x74: this.setMemory(this.getRegisterPair('H'), this.state.registers.H); cycles = 7; break;
      case 0x75: this.setMemory(this.getRegisterPair('H'), this.state.registers.L); cycles = 7; break;

      // MVI Instructions
      case 0x3E: this.state.registers.A = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x06: this.state.registers.B = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x0E: this.state.registers.C = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x16: this.state.registers.D = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x1E: this.state.registers.E = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x26: this.state.registers.H = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x2E: this.state.registers.L = this.getMemory(this.state.registers.PC++); cycles = 7; break;
      case 0x36: this.setMemory(this.getRegisterPair('H'), this.getMemory(this.state.registers.PC++)); cycles = 10; break;

      // LDA/STA/LHLD/SHLD/LDAX/STAX/XCHG
      case 0x3A: // LDA
        {
          const low = this.getMemory(this.state.registers.PC++);
          const high = this.getMemory(this.state.registers.PC++);
          this.state.registers.A = this.getMemory((high << 8) | low);
          cycles = 13;
        }
        break;
      case 0x32: // STA
        {
          const low = this.getMemory(this.state.registers.PC++);
          const high = this.getMemory(this.state.registers.PC++);
          this.setMemory((high << 8) | low, this.state.registers.A);
          cycles = 13;
        }
        break;
      case 0x2A: // LHLD
        {
          const low = this.getMemory(this.state.registers.PC++);
          const high = this.getMemory(this.state.registers.PC++);
          const addr = (high << 8) | low;
          this.state.registers.L = this.getMemory(addr);
          this.state.registers.H = this.getMemory(addr + 1);
          cycles = 16;
        }
        break;
      case 0x22: // SHLD
        {
          const low = this.getMemory(this.state.registers.PC++);
          const high = this.getMemory(this.state.registers.PC++);
          const addr = (high << 8) | low;
          this.setMemory(addr, this.state.registers.L);
          this.setMemory(addr + 1, this.state.registers.H);
          cycles = 16;
        }
        break;
      case 0x0A: // LDAX B
        this.state.registers.A = this.getMemory(this.getRegisterPair('B'));
        cycles = 7;
        break;
      case 0x1A: // LDAX D
        this.state.registers.A = this.getMemory(this.getRegisterPair('D'));
        cycles = 7;
        break;
      case 0x02: // STAX B
        this.setMemory(this.getRegisterPair('B'), this.state.registers.A);
        cycles = 7;
        break;
      case 0x12: // STAX D
        this.setMemory(this.getRegisterPair('D'), this.state.registers.A);
        cycles = 7;
        break;
      case 0xEB: // XCHG
        {
          const tempH = this.state.registers.H;
          const tempL = this.state.registers.L;
          this.state.registers.H = this.state.registers.D;
          this.state.registers.L = this.state.registers.E;
          this.state.registers.D = tempH;
          this.state.registers.E = tempL;
          cycles = 5;
        }
        break;

      // Arithmetic
      case 0x87: this.add8Bit(this.state.registers.A); cycles = 4; break;
      case 0x80: this.add8Bit(this.state.registers.B); cycles = 4; break;
      case 0x81: this.add8Bit(this.state.registers.C); cycles = 4; break;
      case 0x82: this.add8Bit(this.state.registers.D); cycles = 4; break;
      case 0x83: this.add8Bit(this.state.registers.E); cycles = 4; break;
      case 0x84: this.add8Bit(this.state.registers.H); cycles = 4; break;
      case 0x85: this.add8Bit(this.state.registers.L); cycles = 4; break;
      case 0x86: this.add8Bit(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xC6: this.add8Bit(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // ADI

      case 0x8F: this.add8Bit(this.state.registers.A + this.state.flags.CY); cycles = 4; break; // ADC
      case 0x88: this.add8Bit(this.state.registers.B + this.state.flags.CY); cycles = 4; break;
      case 0x89: this.add8Bit(this.state.registers.C + this.state.flags.CY); cycles = 4; break;
      case 0x8A: this.add8Bit(this.state.registers.D + this.state.flags.CY); cycles = 4; break;
      case 0x8B: this.add8Bit(this.state.registers.E + this.state.flags.CY); cycles = 4; break;
      case 0x8C: this.add8Bit(this.state.registers.H + this.state.flags.CY); cycles = 4; break;
      case 0x8D: this.add8Bit(this.state.registers.L + this.state.flags.CY); cycles = 4; break;
      case 0x8E: this.add8Bit(this.getMemory(this.getRegisterPair('H')) + this.state.flags.CY); cycles = 7; break;
      case 0xCE: this.add8Bit(this.getMemory(this.state.registers.PC++) + this.state.flags.CY); cycles = 7; break; // ACI

      case 0x97: this.sub8Bit(this.state.registers.A); cycles = 4; break;
      case 0x90: this.sub8Bit(this.state.registers.B); cycles = 4; break;
      case 0x91: this.sub8Bit(this.state.registers.C); cycles = 4; break;
      case 0x92: this.sub8Bit(this.state.registers.D); cycles = 4; break;
      case 0x93: this.sub8Bit(this.state.registers.E); cycles = 4; break;
      case 0x94: this.sub8Bit(this.state.registers.H); cycles = 4; break;
      case 0x95: this.sub8Bit(this.state.registers.L); cycles = 4; break;
      case 0x96: this.sub8Bit(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xD6: this.sub8Bit(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // SUI

      case 0x9F: this.sub8Bit(this.state.registers.A + this.state.flags.CY); cycles = 4; break; // SBB
      case 0x98: this.sub8Bit(this.state.registers.B + this.state.flags.CY); cycles = 4; break;
      case 0x99: this.sub8Bit(this.state.registers.C + this.state.flags.CY); cycles = 4; break;
      case 0x9A: this.sub8Bit(this.state.registers.D + this.state.flags.CY); cycles = 4; break;
      case 0x9B: this.sub8Bit(this.state.registers.E + this.state.flags.CY); cycles = 4; break;
      case 0x9C: this.sub8Bit(this.state.registers.H + this.state.flags.CY); cycles = 4; break;
      case 0x9D: this.sub8Bit(this.state.registers.L + this.state.flags.CY); cycles = 4; break;
      case 0x9E: this.sub8Bit(this.getMemory(this.getRegisterPair('H')) + this.state.flags.CY); cycles = 7; break;
      case 0xDE: this.sub8Bit(this.getMemory(this.state.registers.PC++) + this.state.flags.CY); cycles = 7; break; // SBI

      // INR
      case 0x3C: this.state.registers.A = this.inr(this.state.registers.A); cycles = 5; break;
      case 0x04: this.state.registers.B = this.inr(this.state.registers.B); cycles = 5; break;
      case 0x0C: this.state.registers.C = this.inr(this.state.registers.C); cycles = 5; break;
      case 0x14: this.state.registers.D = this.inr(this.state.registers.D); cycles = 5; break;
      case 0x1C: this.state.registers.E = this.inr(this.state.registers.E); cycles = 5; break;
      case 0x24: this.state.registers.H = this.inr(this.state.registers.H); cycles = 5; break;
      case 0x2C: this.state.registers.L = this.inr(this.state.registers.L); cycles = 5; break;
      case 0x34:
        {
          const addr = this.getRegisterPair('H');
          const val = this.getMemory(addr);
          const res = this.inr(val);
          this.setMemory(addr, res);
          cycles = 10;
        }
        break;

      // DCR
      case 0x3D: this.state.registers.A = this.dcr(this.state.registers.A); cycles = 5; break;
      case 0x05: this.state.registers.B = this.dcr(this.state.registers.B); cycles = 5; break;
      case 0x0D: this.state.registers.C = this.dcr(this.state.registers.C); cycles = 5; break;
      case 0x15: this.state.registers.D = this.dcr(this.state.registers.D); cycles = 5; break;
      case 0x1D: this.state.registers.E = this.dcr(this.state.registers.E); cycles = 5; break;
      case 0x25: this.state.registers.H = this.dcr(this.state.registers.H); cycles = 5; break;
      case 0x2D: this.state.registers.L = this.dcr(this.state.registers.L); cycles = 5; break;
      case 0x35:
        {
          const addr = this.getRegisterPair('H');
          const val = this.getMemory(addr);
          const res = this.dcr(val);
          this.setMemory(addr, res);
          cycles = 10;
        }
        break;

      // INX
      case 0x03: this.inx('B'); cycles = 5; break;
      case 0x13: this.inx('D'); cycles = 5; break;
      case 0x23: this.inx('H'); cycles = 5; break;
      case 0x33: this.inx('SP'); cycles = 5; break;

      // DCX
      case 0x0B: this.dcx('B'); cycles = 5; break;
      case 0x1B: this.dcx('D'); cycles = 5; break;
      case 0x2B: this.dcx('H'); cycles = 5; break;
      case 0x3B: this.dcx('SP'); cycles = 5; break;

      // DAD
      case 0x09: this.dad('B'); cycles = 10; break;
      case 0x19: this.dad('D'); cycles = 10; break;
      case 0x29: this.dad('H'); cycles = 10; break;
      case 0x39: this.dad('SP'); cycles = 10; break;

      // Logical
      case 0xA7: this.and8Bit(this.state.registers.A); cycles = 4; break;
      case 0xA0: this.and8Bit(this.state.registers.B); cycles = 4; break;
      case 0xA1: this.and8Bit(this.state.registers.C); cycles = 4; break;
      case 0xA2: this.and8Bit(this.state.registers.D); cycles = 4; break;
      case 0xA3: this.and8Bit(this.state.registers.E); cycles = 4; break;
      case 0xA4: this.and8Bit(this.state.registers.H); cycles = 4; break;
      case 0xA5: this.and8Bit(this.state.registers.L); cycles = 4; break;
      case 0xA6: this.and8Bit(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xE6: this.and8Bit(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // ANI

      case 0xAF: this.xor8Bit(this.state.registers.A); cycles = 4; break;
      case 0xA8: this.xor8Bit(this.state.registers.B); cycles = 4; break;
      case 0xA9: this.xor8Bit(this.state.registers.C); cycles = 4; break;
      case 0xAA: this.xor8Bit(this.state.registers.D); cycles = 4; break;
      case 0xAB: this.xor8Bit(this.state.registers.E); cycles = 4; break;
      case 0xAC: this.xor8Bit(this.state.registers.H); cycles = 4; break;
      case 0xAD: this.xor8Bit(this.state.registers.L); cycles = 4; break;
      case 0xAE: this.xor8Bit(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xEE: this.xor8Bit(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // XRI

      case 0xB7: this.or8Bit(this.state.registers.A); cycles = 4; break;
      case 0xB0: this.or8Bit(this.state.registers.B); cycles = 4; break;
      case 0xB1: this.or8Bit(this.state.registers.C); cycles = 4; break;
      case 0xB2: this.or8Bit(this.state.registers.D); cycles = 4; break;
      case 0xB3: this.or8Bit(this.state.registers.E); cycles = 4; break;
      case 0xB4: this.or8Bit(this.state.registers.H); cycles = 4; break;
      case 0xB5: this.or8Bit(this.state.registers.L); cycles = 4; break;
      case 0xB6: this.or8Bit(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xF6: this.or8Bit(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // ORI

      case 0xBF: this.cmp(this.state.registers.A); cycles = 4; break;
      case 0xB8: this.cmp(this.state.registers.B); cycles = 4; break;
      case 0xB9: this.cmp(this.state.registers.C); cycles = 4; break;
      case 0xBA: this.cmp(this.state.registers.D); cycles = 4; break;
      case 0xBB: this.cmp(this.state.registers.E); cycles = 4; break;
      case 0xBC: this.cmp(this.state.registers.H); cycles = 4; break;
      case 0xBD: this.cmp(this.state.registers.L); cycles = 4; break;
      case 0xBE: this.cmp(this.getMemory(this.getRegisterPair('H'))); cycles = 7; break;
      case 0xFE: this.cmp(this.getMemory(this.state.registers.PC++)); cycles = 7; break; // CPI

      // Rotate
      case 0x07: // RLC
        {
          const msb = (this.state.registers.A & 0x80) >> 7;
          this.state.registers.A = ((this.state.registers.A << 1) | msb) & 0xFF;
          this.state.flags.CY = msb;
          cycles = 4;
        }
        break;
      case 0x0F: // RRC
        {
          const lsb = this.state.registers.A & 0x01;
          this.state.registers.A = ((this.state.registers.A >> 1) | (lsb << 7)) & 0xFF;
          this.state.flags.CY = lsb;
          cycles = 4;
        }
        break;
      case 0x17: // RAL
        {
          const msb = (this.state.registers.A & 0x80) >> 7;
          this.state.registers.A = ((this.state.registers.A << 1) | this.state.flags.CY) & 0xFF;
          this.state.flags.CY = msb;
          cycles = 4;
        }
        break;
      case 0x1F: // RAR
        {
          const lsb = this.state.registers.A & 0x01;
          this.state.registers.A = ((this.state.registers.A >> 1) | (this.state.flags.CY << 7)) & 0xFF;
          this.state.flags.CY = lsb;
          cycles = 4;
        }
        break;

      // Special
      case 0x2F: this.state.registers.A = (~this.state.registers.A) & 0xFF; cycles = 4; break; // CMA
      case 0x3F: this.state.flags.CY = 1 - this.state.flags.CY; cycles = 4; break; // CMC
      case 0x37: this.state.flags.CY = 1; cycles = 4; break; // STC
      case 0x27: // DAA
        {
          let a = this.state.registers.A;
          let ac = this.state.flags.AC;
          let cy = this.state.flags.CY;
          let adjust = 0;

          // Lower nibble check
          if ((a & 0x0F) > 9 || ac === 1) {
            adjust += 0x06;
          }

          // Upper nibble check (must account for carry from lower nibble adjustment)
          if ((a >> 4) > 9 || cy === 1 || ((a >> 4) === 9 && (a & 0x0F) > 9)) {
            adjust += 0x60;
            cy = 1;
          }

          let res = a + adjust;
          this.state.registers.A = res & 0xFF;
          
          // Carry flag is set if the upper nibble adjustment was made, or if it was already set.
          if (res > 0xFF) cy = 1;

          // AC flag is set if the first adjustment caused a carry from bit 3 to bit 4
          ac = ((a & 0x0F) + (adjust & 0x0F)) > 0x0F ? 1 : 0;

          this.updateFlags(this.state.registers.A, ac);
          this.state.flags.CY = cy;
          cycles = 4;
        }
        break;

      // Branching
      case 0xC3: this.jmp(true); cycles = 10; break; // JMP
      case 0xC2: this.jmp(this.state.flags.Z === 0); cycles = this.state.flags.Z === 0 ? 10 : 7; break; // JNZ
      case 0xCA: this.jmp(this.state.flags.Z === 1); cycles = this.state.flags.Z === 1 ? 10 : 7; break; // JZ
      case 0xD2: this.jmp(this.state.flags.CY === 0); cycles = this.state.flags.CY === 0 ? 10 : 7; break; // JNC
      case 0xDA: this.jmp(this.state.flags.CY === 1); cycles = this.state.flags.CY === 1 ? 10 : 7; break; // JC
      case 0xF2: this.jmp(this.state.flags.S === 0); cycles = this.state.flags.S === 0 ? 10 : 7; break; // JP
      case 0xFA: this.jmp(this.state.flags.S === 1); cycles = this.state.flags.S === 1 ? 10 : 7; break; // JM
      case 0xEA: this.jmp(this.state.flags.P === 1); cycles = this.state.flags.P === 1 ? 10 : 7; break; // JPE
      case 0xE2: this.jmp(this.state.flags.P === 0); cycles = this.state.flags.P === 0 ? 10 : 7; break; // JPO

      case 0xE9: this.state.registers.PC = this.getRegisterPair('H'); cycles = 5; break; // PCHL

      // Call
      case 0xCD: this.call(true); cycles = 17; break;
      case 0xC4: this.call(this.state.flags.Z === 0); cycles = this.state.flags.Z === 0 ? 17 : 11; break;
      case 0xCC: this.call(this.state.flags.Z === 1); cycles = this.state.flags.Z === 1 ? 17 : 11; break;
      case 0xD4: this.call(this.state.flags.CY === 0); cycles = this.state.flags.CY === 0 ? 17 : 11; break;
      case 0xDC: this.call(this.state.flags.CY === 1); cycles = this.state.flags.CY === 1 ? 17 : 11; break;
      case 0xF4: this.call(this.state.flags.S === 0); cycles = this.state.flags.S === 0 ? 17 : 11; break;
      case 0xFC: this.call(this.state.flags.S === 1); cycles = this.state.flags.S === 1 ? 17 : 11; break;
      case 0xEC: this.call(this.state.flags.P === 1); cycles = this.state.flags.P === 1 ? 17 : 11; break;
      case 0xE4: this.call(this.state.flags.P === 0); cycles = this.state.flags.P === 0 ? 17 : 11; break;

      // Return
      case 0xC9: this.ret(true); cycles = 10; break;
      case 0xC0: this.ret(this.state.flags.Z === 0); cycles = this.state.flags.Z === 0 ? 11 : 5; break;
      case 0xC8: this.ret(this.state.flags.Z === 1); cycles = this.state.flags.Z === 1 ? 11 : 5; break;
      case 0xD0: this.ret(this.state.flags.CY === 0); cycles = this.state.flags.CY === 0 ? 11 : 5; break;
      case 0xD8: this.ret(this.state.flags.CY === 1); cycles = this.state.flags.CY === 1 ? 11 : 5; break;
      case 0xF0: this.ret(this.state.flags.S === 0); cycles = this.state.flags.S === 0 ? 11 : 5; break;
      case 0xF8: this.ret(this.state.flags.S === 1); cycles = this.state.flags.S === 1 ? 11 : 5; break;
      case 0xE8: this.ret(this.state.flags.P === 1); cycles = this.state.flags.P === 1 ? 11 : 5; break;
      case 0xE0: this.ret(this.state.flags.P === 0); cycles = this.state.flags.P === 0 ? 11 : 5; break;

      // RST
      case 0xC7: this.rst(0); cycles = 11; break;
      case 0xCF: this.rst(1); cycles = 11; break;
      case 0xD7: this.rst(2); cycles = 11; break;
      case 0xDF: this.rst(3); cycles = 11; break;
      case 0xE7: this.rst(4); cycles = 11; break;
      case 0xEF: this.rst(5); cycles = 11; break;
      case 0xF7: this.rst(6); cycles = 11; break;
      case 0xFF: this.rst(7); cycles = 11; break;

      // Stack
      case 0xC5: this.push(this.getRegisterPair('B')); cycles = 11; break;
      case 0xD5: this.push(this.getRegisterPair('D')); cycles = 11; break;
      case 0xE5: this.push(this.getRegisterPair('H')); cycles = 11; break;
      case 0xF5:
        {
          const psw = (this.state.registers.A << 8) |
            (this.state.flags.S << 7) | (this.state.flags.Z << 6) |
            (this.state.flags.AC << 4) | (this.state.flags.P << 2) |
            (1 << 1) | (this.state.flags.CY);
          this.push(psw);
          cycles = 11;
        }
        break;

      case 0xC1: this.setRegisterPair('B', this.pop()); cycles = 10; break;
      case 0xD1: this.setRegisterPair('D', this.pop()); cycles = 10; break;
      case 0xE1: this.setRegisterPair('H', this.pop()); cycles = 10; break;
      case 0xF1:
        {
          const psw = this.pop();
          this.state.registers.A = (psw >> 8) & 0xFF;
          const f = psw & 0xFF;
          this.state.flags.S = (f >> 7) & 1;
          this.state.flags.Z = (f >> 6) & 1;
          this.state.flags.AC = (f >> 4) & 1;
          this.state.flags.P = (f >> 2) & 1;
          this.state.flags.CY = f & 1;
          cycles = 10;
        }
        break;

      case 0xE3: // XTHL
        {
          const sp = this.state.registers.SP;
          const l = this.getMemory(sp);
          const h = this.getMemory(sp + 1);
          this.setMemory(sp, this.state.registers.L);
          this.setMemory(sp + 1, this.state.registers.H);
          this.state.registers.L = l;
          this.state.registers.H = h;
          cycles = 18;
        }
        break;
      case 0xF9: // SPHL
        this.state.registers.SP = this.getRegisterPair('H');
        cycles = 5;
        break;

      // I/O
      case 0xDB: // IN
        {
          const port = this.getMemory(this.state.registers.PC++);
          this.state.registers.A = this.getPort(port);
          cycles = 10;
        }
        break;
      case 0xD3: // OUT
        {
          const port = this.getMemory(this.state.registers.PC++);
          this.setPort(port, this.state.registers.A);
          cycles = 10;
        }
        break;

      // Interrupts
      case 0xFB: this.state.interruptsEnabled = true; cycles = 4; break; // EI
      case 0xF3: this.state.interruptsEnabled = false; cycles = 4; break; // DI
      case 0x20: // RIM
        {
          // Bit 0-2: Masks for 5.5, 6.5, 7.5
          // Bit 3: IE
          // Bit 4-6: Pending 5.5, 6.5, 7.5
          // Bit 7: SID
          let res = this.state.interruptMask & 0x07;
          if (this.state.interruptsEnabled) res |= 0x08;
          res |= (this.state.pendingInterrupts & 0x07) << 4;
          if (this.state.serialInput) res |= 0x80;
          this.state.registers.A = res;
          cycles = 4;
        }
        break;
      case 0x30: // SIM
        {
          const a = this.state.registers.A;
          // Bit 0-2: Masks
          // Bit 3: MSE
          // Bit 4: Reset 7.5
          // Bit 6: SOE
          // Bit 7: SOD
          if (a & 0x08) { // MSE
            this.state.interruptMask = (this.state.interruptMask & ~0x07) | (a & 0x07);
          }
          if (a & 0x10) { // Reset RST 7.5
            this.state.pendingInterrupts &= ~0x04;
          }
          if (a & 0x40) { // SOE
            this.state.serialOutput = (a & 0x80) ? 1 : 0;
          }
          cycles = 4;
        }
        break;

      case 0x00: cycles = 4; break; // NOP
      case 0x76: this.state.halted = true; cycles = 7; break; // HLT

      // LXI
      case 0x01: this.lxi('B'); cycles = 10; break;
      case 0x11: this.lxi('D'); cycles = 10; break;
      case 0x21: this.lxi('H'); cycles = 10; break;
      case 0x31: this.lxi('SP'); cycles = 10; break;

      default: cycles = 4; break;
    }

    this.state.clockCycles += cycles;
    return cycles;
  }

  // Helpers for instructions to reduce switch size
  private inr(val: number): number {
    const res = (val + 1) & 0xFF;
    const ac = ((val & 0x0F) + 1) > 0x0F ? 1 : 0;
    this.updateFlags(res, ac);
    // INR does not affect CY
    return res;
  }

  private dcr(val: number): number {
    const res = (val - 1) & 0xFF;
    const ac = ((val & 0x0F) - 1) < 0 ? 1 : 0;
    this.updateFlags(res, ac);
    // DCR does not affect CY
    return res;
  }

  private inx(rp: 'B' | 'D' | 'H' | 'SP'): void {
    const val = (this.getRegisterPair(rp) + 1) & 0xFFFF;
    this.setRegisterPair(rp, val);
  }

  private dcx(rp: 'B' | 'D' | 'H' | 'SP'): void {
    const val = (this.getRegisterPair(rp) - 1) & 0xFFFF;
    this.setRegisterPair(rp, val);
  }

  private dad(rp: 'B' | 'D' | 'H' | 'SP'): void {
    const hl = this.getRegisterPair('H');
    const other = this.getRegisterPair(rp);
    const sum = hl + other;
    this.state.flags.CY = sum > 0xFFFF ? 1 : 0;
    this.setRegisterPair('H', sum & 0xFFFF);
  }

  private cmp(val: number): void {
    const res = this.state.registers.A - val;
    const ac = ((this.state.registers.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0;
    this.state.flags.CY = res < 0 ? 1 : 0;
    this.updateFlags(res & 0xFF, ac);
  }

  private jmp(cond: boolean): void {
    const low = this.getMemory(this.state.registers.PC++);
    const high = this.getMemory(this.state.registers.PC++);
    if (cond) {
      this.state.registers.PC = (high << 8) | low;
    }
  }

  private call(cond: boolean): void {
    const low = this.getMemory(this.state.registers.PC++);
    const high = this.getMemory(this.state.registers.PC++);
    if (cond) {
      this.push(this.state.registers.PC);
      this.state.registers.PC = (high << 8) | low;
    }
  }

  private ret(cond: boolean): void {
    if (cond) {
      this.state.registers.PC = this.pop();
    }
  }

  private rst(n: number): void {
    this.push(this.state.registers.PC);
    this.state.registers.PC = n * 8;
  }

  private lxi(rp: 'B' | 'D' | 'H' | 'SP'): void {
    const low = this.getMemory(this.state.registers.PC++);
    const high = this.getMemory(this.state.registers.PC++);
    this.setRegisterPair(rp, (high << 8) | low);
  }

  run(): { cycles: number, trace: number[] } {
    let totalCycles = 0;
    const maxInstructions = 10000;
    let instructionCount = 0;
    const trace: number[] = [];

    while (!this.state.halted && !this.hasBreakpoint() && instructionCount < maxInstructions) {
      trace.push(this.state.registers.PC);
      totalCycles += this.step();
      instructionCount++;
      if (this.hasBreakpoint()) break;
    }
    return { cycles: totalCycles, trace };
  }

  loadProgram(program: Uint8Array, startAddress: number = 0x0000): void {
    for (let i = 0; i < program.length; i++) {
      this.setMemory(startAddress + i, program[i]);
    }
    this.state.registers.PC = startAddress;
  }
}