import { Emulator8085 } from './emulator'
import { TraceEngine, InstructionTrace, ExecutionStatistics } from './trace-engine'

export type DebuggerStatus = 'Idle' | 'Running' | 'Paused' | 'Halted' | 'Error'

export interface DebuggerState {
  pc: number;
  opcode: string | null;
  status: DebuggerStatus;
  instructionCount: number;
}

export type DebuggerStateListener = (state: DebuggerState) => void;
export type TraceListener = (history: InstructionTrace[], stats: ExecutionStatistics) => void;
export type ConsoleListener = (message: string) => void;

export class DebuggerService {
  public emulator: Emulator8085;
  public traceEngine: TraceEngine;
  
  private status: DebuggerStatus = 'Idle';
  private instructionCount: number = 0;
  
  private stateListeners: Set<DebuggerStateListener> = new Set();
  private traceListeners: Set<TraceListener> = new Set();
  private consoleListeners: Set<ConsoleListener> = new Set();

  // Reference to source map to link PC to instruction metadata
  private sourceMap: Map<number, { source: string, bytes: number[] }> = new Map();

  constructor() {
    this.emulator = new Emulator8085();
    this.traceEngine = new TraceEngine(this.emulator);
  }

  public subscribeState(listener: DebuggerStateListener) {
    this.stateListeners.add(listener);
    this.notifyState();
    return () => this.stateListeners.delete(listener);
  }

  public subscribeTrace(listener: TraceListener) {
    this.traceListeners.add(listener);
    this.notifyTrace();
    return () => this.traceListeners.delete(listener);
  }

  public subscribeConsole(listener: ConsoleListener) {
    this.consoleListeners.add(listener);
    return () => this.consoleListeners.delete(listener);
  }

  private notifyState() {
    const pc = this.emulator.getState().registers.PC;
    let opcode = null;
    
    if (this.emulator.getState().halted) {
       this.status = 'Halted';
    } else if (this.emulator.hasBreakpoint()) {
       this.status = 'Paused';
    }

    const mapped = this.sourceMap.get(pc);
    if (mapped && mapped.bytes.length > 0) {
      opcode = mapped.bytes[0].toString(16).toUpperCase().padStart(2, "0");
    } else if (this.emulator.getState().halted) {
      opcode = "76"; // HLT
    } else {
      opcode = this.emulator.getState().memory[pc].toString(16).toUpperCase().padStart(2, "0");
    }

    const state: DebuggerState = {
      pc,
      opcode,
      status: this.status,
      instructionCount: this.instructionCount
    };
    
    this.stateListeners.forEach(l => l(state));
  }

  private notifyTrace() {
    const history = this.traceEngine.getTraceHistory();
    const stats = this.traceEngine.getStatistics();
    this.traceListeners.forEach(l => l(history, stats));
  }

  private log(msg: string) {
    this.consoleListeners.forEach(l => l(msg));
  }

  public setSourceMap(instructions: any[]) {
    this.sourceMap.clear();
    instructions.forEach(inst => {
      if (inst.address !== undefined) {
        this.sourceMap.set(inst.address, { source: inst.source, bytes: inst.bytes });
      }
    });
  }

  public reset(clearTrace: boolean = true) {
    this.emulator.reset();
    if (clearTrace) {
      this.traceEngine.reset();
      this.instructionCount = 0;
    }
    this.status = 'Idle';
    this.notifyState();
    if (clearTrace) this.notifyTrace();
  }

  public loadProgram(machineCode: Uint8Array) {
    this.emulator.loadProgram(machineCode);
    this.status = 'Idle';
    this.notifyState();
  }

  public setBreakpoints(addresses: number[]) {
    this.emulator.clearBreakpoints();
    addresses.forEach(addr => this.emulator.setBreakpoint(addr));
    this.notifyState();
  }

  public stepInto() {
    if (this.emulator.getState().halted) {
      this.log('[WARN] Cannot step, CPU is halted.');
      return;
    }

    this.status = 'Running';
    this.notifyState();
    
    try {
      this.executeSingleStep();
    } catch (e) {
      this.status = 'Error';
      this.log(`[ERROR] Execution failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    
    this.status = this.emulator.getState().halted ? 'Halted' : 'Paused';
    this.notifyState();
    this.notifyTrace();
  }

  public run() {
    if (this.emulator.getState().halted) {
      this.log('[WARN] Cannot run, CPU is halted.');
      return;
    }
    
    this.status = 'Running';
    this.notifyState();
    this.log('[RUN] Executing program...');

    // Small delay to allow UI to show running state
    setTimeout(() => {
      try {
        let instructionsRun = 0;
        const maxInstructions = 10000;
        
        while (!this.emulator.getState().halted && !this.emulator.hasBreakpoint() && instructionsRun < maxInstructions) {
          this.executeSingleStep();
          instructionsRun++;
          if (this.emulator.hasBreakpoint()) break;
        }
        
        this.status = this.emulator.getState().halted ? 'Halted' : 'Paused';
        this.log(`[RUN] Execution stopped. Ran ${instructionsRun} instructions.`);
      } catch (e) {
        this.status = 'Error';
        this.log(`[ERROR] Execution failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
      
      this.notifyState();
      this.notifyTrace();
    }, 10);
  }

  private executeSingleStep() {
    const pc = this.emulator.getState().registers.PC;
    const opcodeByte = this.emulator.getState().memory[pc];
    const mapped = this.sourceMap.get(pc);
    const source = mapped ? mapped.source : "Unknown";
    
    this.traceEngine.beforeInstruction(opcodeByte, source);
    const cycles = this.emulator.step();
    this.traceEngine.afterInstruction(cycles);
    
    this.instructionCount++;
  }
}
