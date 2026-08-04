import { Emulator8085, ExecutionEvent, ExecutionEventListener, State } from "./emulator";
import { INSTRUCTION_METADATA } from "./instruction-metadata";

export interface InstructionTrace {
  pc: number;
  opcode: string;
  mnemonic: string;
  changedRegisters: Record<string, string>;
  changedFlags: Record<string, number>;
  registersBefore: Record<string, number>;
  flagsBefore: Record<string, number>;
  memoryReads: { address: number; value: number }[];
  memoryWrites: { address: number; value: number; oldValue?: number }[];
  machineCycles: number;
  tStates: number;
}

export interface ExecutionStatistics {
  instructionsExecuted: number;
  machineCycles: number;
  tStates: number;
  memoryReads: number;
  memoryWrites: number;
  stackOperations: number;
}

export class TraceEngine implements ExecutionEventListener {
  private emulator: Emulator8085;
  private stats: ExecutionStatistics;
  private currentTrace: Partial<InstructionTrace> | null = null;
  private prevState: State | null = null;
  private traces: InstructionTrace[] = [];
  
  // Track events during a single instruction execution
  private currentMemReads: { address: number; value: number }[] = [];
  private currentMemWrites: { address: number; value: number; oldValue?: number }[] = [];

  constructor(emulator: Emulator8085) {
    this.emulator = emulator;
    this.stats = {
      instructionsExecuted: 0,
      machineCycles: 0,
      tStates: 0,
      memoryReads: 0,
      memoryWrites: 0,
      stackOperations: 0,
    };
    this.emulator.addEventListener(this);
  }

  reset() {
    this.stats = {
      instructionsExecuted: 0,
      machineCycles: 0,
      tStates: 0,
      memoryReads: 0,
      memoryWrites: 0,
      stackOperations: 0,
    };
    this.traces = [];
    this.currentTrace = null;
    this.currentMemReads = [];
    this.currentMemWrites = [];
  }

  onEvent(event: ExecutionEvent): void {
    if (event.type === 'memory_read') {
      this.stats.memoryReads++;
      if (event.address !== undefined && event.value !== undefined) {
        this.currentMemReads.push({ address: event.address, value: event.value });
      }
    } else if (event.type === 'memory_write') {
      this.stats.memoryWrites++;
      if (event.address !== undefined && event.value !== undefined) {
        this.currentMemWrites.push({ address: event.address, value: event.value, oldValue: event.oldValue });
      }
    } else if (event.type === 'stack_push' || event.type === 'stack_pop') {
      this.stats.stackOperations++;
    }
  }

  beforeInstruction(opcodeByte: number, sourceMnemonic: string) {
    this.prevState = this.emulator.getState(); // this is a shallow copy, but registers and flags are nested objects which are copied by reference!
    // Wait, Emulator8085.getState() returns { ...this.state }, but state.registers is a reference to the same object!
    // Let's do a deep clone of registers and flags
    this.prevState = {
      ...this.prevState,
      registers: { ...this.prevState.registers },
      flags: { ...this.prevState.flags },
    };

    const hexOpcode = opcodeByte.toString(16).toUpperCase().padStart(2, '0');
    const meta = INSTRUCTION_METADATA[hexOpcode];
    
    this.currentTrace = {
      pc: this.prevState.registers.PC,
      opcode: hexOpcode,
      mnemonic: sourceMnemonic || (meta ? meta.mnemonic : "Unknown"),
      changedRegisters: {},
      changedFlags: {},
      registersBefore: { ...this.prevState.registers },
      flagsBefore: { ...this.prevState.flags },
      memoryReads: [],
      memoryWrites: [],
      machineCycles: meta ? meta.machineCycles : 1,
      tStates: 0, // updated after step
    };
    
    this.currentMemReads = [];
    this.currentMemWrites = [];
  }

  afterInstruction(tStatesTaken: number) {
    if (!this.currentTrace || !this.prevState) return;

    this.stats.instructionsExecuted++;
    this.stats.tStates += tStatesTaken;
    this.stats.machineCycles += this.currentTrace.machineCycles || 1;

    this.currentTrace.tStates = tStatesTaken;
    this.currentTrace.memoryReads = [...this.currentMemReads];
    this.currentTrace.memoryWrites = [...this.currentMemWrites];

    const currentState = this.emulator.getState();

    // Diff registers
    for (const [reg, val] of Object.entries(currentState.registers)) {
      const oldVal = (this.prevState.registers as any)[reg];
      if (oldVal !== val && reg !== 'PC') { // Skip PC changes as they are implicit
        this.currentTrace.changedRegisters![reg] = val.toString(16).toUpperCase().padStart(reg === 'SP' ? 4 : 2, '0') + 'H';
      }
    }

    // Diff flags
    for (const [flag, val] of Object.entries(currentState.flags)) {
      const oldVal = (this.prevState.flags as any)[flag];
      if (oldVal !== val) {
        this.currentTrace.changedFlags![flag] = val;
      }
    }

    this.traces.push(this.currentTrace as InstructionTrace);
    if (this.traces.length > 100) {
      this.traces.shift(); // Keep last 100 for trace history
    }

    this.currentTrace = null;
    this.prevState = null;
  }

  getStatistics(): ExecutionStatistics {
    return { ...this.stats };
  }

  getTraceHistory(): InstructionTrace[] {
    return [...this.traces];
  }
  
  popTrace(): InstructionTrace | undefined {
    const trace = this.traces.pop();
    if (trace) {
      this.stats.instructionsExecuted--;
      this.stats.tStates -= trace.tStates;
      this.stats.machineCycles -= trace.machineCycles || 1;
      this.stats.memoryReads -= trace.memoryReads.length;
      this.stats.memoryWrites -= trace.memoryWrites.length;
    }
    return trace;
  }
}
