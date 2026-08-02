import { describe, it, expect, beforeEach } from 'vitest';
import { Emulator8085 } from '../lib/emulator';
import { Assembler8085 } from '../lib/assembler';

describe('8085 DAA Instruction Tests', () => {
  let emulator: Emulator8085;
  let assembler: Assembler8085;

  beforeEach(() => {
    emulator = new Emulator8085();
    assembler = new Assembler8085();
  });

  const runCode = (code: string) => {
    const result = assembler.assemble(code);
    expect(result.errors).toHaveLength(0);
    emulator.loadProgram(result.machineCode);
    emulator.run();
    return emulator.getState();
  };

  it('Test 1: Basic BCD addition without adjust (12 + 34 = 46)', () => {
    const code = `
      MVI A, 12H
      MVI B, 34H
      ADD B
      DAA
      HLT
    `;
    const state = runCode(code);
    expect(state.registers.A).toBe(0x46);
    expect(state.flags.CY).toBe(0);
    expect(state.flags.AC).toBe(0);
  });

  it('Test 2: Lower nibble adjustment (38 + 45 = 83)', () => {
    // 38H + 45H = 7DH. D > 9, so add 06H. 7D + 06 = 83H
    const code = `
      MVI A, 38H
      MVI B, 45H
      ADD B
      DAA
      HLT
    `;
    const state = runCode(code);
    expect(state.registers.A).toBe(0x83);
    expect(state.flags.CY).toBe(0);
  });

  it('Test 3: Upper nibble adjustment (85 + 34 = 19)', () => {
    // 85H + 34H = B9H. B > 9, so add 60H. B9 + 60 = 119H -> 19H with CY=1
    const code = `
      MVI A, 85H
      MVI B, 34H
      ADD B
      DAA
      HLT
    `;
    const state = runCode(code);
    expect(state.registers.A).toBe(0x19);
    expect(state.flags.CY).toBe(1);
  });

  it('Test 4: Both nibbles adjustment (58 + 49 = 07)', () => {
    // 58H + 49H = A1H. 8+9=11H -> 1H (carry 1). A=A (10). Wait, ADD does 58+49 = A1. 
    // DAA: lower is 1, but AC was set during ADD (8+9=17 > 15 -> carry). So add 06 -> A7.
    // upper is A > 9. So add 60 -> 107 -> 07, CY=1.
    const code = `
      MVI A, 58H
      MVI B, 49H
      ADD B
      DAA
      HLT
    `;
    const state = runCode(code);
    expect(state.registers.A).toBe(0x07);
    expect(state.flags.CY).toBe(1);
  });
});
