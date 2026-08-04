import json

metadata = {}

registers = ['B', 'C', 'D', 'E', 'H', 'L', 'M', 'A']
pairs = ['B', 'D', 'H', 'SP']
pairs_push_pop = ['B', 'D', 'H', 'PSW']
conditions = ['NZ', 'Z', 'NC', 'C', 'PO', 'PE', 'P', 'M']

def add(opcode, mnemonic, length, m_cycles, t_states, flags, category, desc, read_regs, write_regs, mem_read, mem_write, addr_mode):
    hex_op = f"{opcode:02X}"
    metadata[hex_op] = {
        "opcode": hex_op,
        "mnemonic": mnemonic,
        "length": length,
        "machineCycles": m_cycles,
        "tStates": t_states,
        "flagsAffected": flags,
        "category": category,
        "description": desc,
        "registersRead": read_regs,
        "registersWritten": write_regs,
        "memoryReads": mem_read,
        "memoryWrites": mem_write,
        "addressingMode": addr_mode
    }

# Data Transfer
for dst_idx, dst in enumerate(registers):
    for src_idx, src in enumerate(registers):
        if dst == 'M' and src == 'M': continue # 76 is HLT
        opcode = 0x40 + (dst_idx << 3) + src_idx
        
        m_cycles = 1
        t_states = 4
        mem_read = 0
        mem_write = 0
        reads = []
        if src == 'M': 
            m_cycles = 2
            t_states = 7
            mem_read = 1
            reads = ['H', 'L']
        elif src != 'A':
            reads = [src]
        else:
            reads = ['A']

        writes = []
        if dst == 'M':
            m_cycles = 2
            t_states = 7
            mem_write = 1
            reads.extend(['H', 'L'])
        elif dst != 'A':
            writes = [dst]
        else:
            writes = ['A']

        add(opcode, f"MOV {dst}, {src}", 1, m_cycles, t_states, [], "Data Transfer", f"Move content of {src} to {dst}.", reads, writes, mem_read, mem_write, "Register" if dst != 'M' and src != 'M' else "Register Indirect")

for idx, reg in enumerate(registers):
    opcode = 0x06 + (idx << 3)
    mem_read = 1
    mem_write = 0
    m_cycles = 2
    t_states = 7
    reads = []
    writes = []
    if reg == 'M':
        m_cycles = 3
        t_states = 10
        mem_write = 1
        reads = ['H', 'L']
    else:
        writes = [reg]
    add(opcode, f"MVI {reg}, data8", 2, m_cycles, t_states, [], "Data Transfer", f"Move 8-bit immediate data into {reg}.", reads, writes, mem_read, mem_write, "Immediate")

for idx, rp in enumerate(pairs):
    opcode = 0x01 + (idx << 4)
    writes = [rp, 'C'] if rp == 'B' else [rp, 'E'] if rp == 'D' else [rp, 'L'] if rp == 'H' else ['SP']
    add(opcode, f"LXI {rp}, data16", 3, 3, 10, [], "Data Transfer", f"Load 16-bit immediate data into register pair {rp}.", [], writes, 2, 0, "Immediate")

add(0x3A, "LDA addr16", 3, 4, 13, [], "Data Transfer", "Load accumulator direct from memory.", [], ['A'], 3, 0, "Direct")
add(0x32, "STA addr16", 3, 4, 13, [], "Data Transfer", "Store accumulator direct to memory.", ['A'], [], 2, 1, "Direct")
add(0x2A, "LHLD addr16", 3, 5, 16, [], "Data Transfer", "Load H and L registers direct from memory.", [], ['H', 'L'], 4, 0, "Direct")
add(0x22, "SHLD addr16", 3, 5, 16, [], "Data Transfer", "Store H and L registers direct to memory.", ['H', 'L'], [], 2, 2, "Direct")

add(0x0A, "LDAX B", 1, 2, 7, [], "Data Transfer", "Load accumulator indirect using BC.", ['B', 'C'], ['A'], 1, 0, "Register Indirect")
add(0x1A, "LDAX D", 1, 2, 7, [], "Data Transfer", "Load accumulator indirect using DE.", ['D', 'E'], ['A'], 1, 0, "Register Indirect")
add(0x02, "STAX B", 1, 2, 7, [], "Data Transfer", "Store accumulator indirect using BC.", ['A', 'B', 'C'], [], 0, 1, "Register Indirect")
add(0x12, "STAX D", 1, 2, 7, [], "Data Transfer", "Store accumulator indirect using DE.", ['A', 'D', 'E'], [], 0, 1, "Register Indirect")
add(0xEB, "XCHG", 1, 1, 4, [], "Data Transfer", "Exchange HL and DE.", ['H', 'L', 'D', 'E'], ['H', 'L', 'D', 'E'], 0, 0, "Register")

# Arithmetic
arith_ops = ['ADD', 'ADC', 'SUB', 'SBB', 'ANA', 'XRA', 'ORA', 'CMP']
for op_idx, op in enumerate(arith_ops):
    for reg_idx, reg in enumerate(registers):
        opcode = 0x80 + (op_idx << 3) + reg_idx
        m_cycles = 1 if reg != 'M' else 2
        t_states = 4 if reg != 'M' else 7
        mem_read = 1 if reg == 'M' else 0
        reads = ['A', reg] if reg != 'M' else ['A', 'H', 'L']
        writes = ['A'] if op != 'CMP' else []
        flags = ['Z', 'S', 'P', 'CY', 'AC']
        desc = f"{op} {reg} to Accumulator."
        cat = "Arithmetic" if op_idx < 4 else "Logical" if op_idx < 7 else "Logical (Compare)"
        add(opcode, f"{op} {reg}", 1, m_cycles, t_states, flags, cat, desc, reads, writes, mem_read, 0, "Register" if reg != 'M' else "Register Indirect")

arith_imm_ops = ['ADI', 'ACI', 'SUI', 'SBI', 'ANI', 'XRI', 'ORI', 'CPI']
for op_idx, op in enumerate(arith_imm_ops):
    opcode = 0xC6 + (op_idx << 3)
    cat = "Arithmetic" if op_idx < 4 else "Logical" if op_idx < 7 else "Logical (Compare)"
    flags = ['Z', 'S', 'P', 'CY', 'AC']
    add(opcode, f"{op} data8", 2, 2, 7, flags, cat, f"{op} immediate to Accumulator.", ['A'], ['A'] if op != 'CPI' else [], 1, 0, "Immediate")

for idx, reg in enumerate(registers):
    m_cycles = 1 if reg != 'M' else 3
    t_states = 4 if reg != 'M' else 10
    mem_read = 1 if reg == 'M' else 0
    mem_write = 1 if reg == 'M' else 0
    reads = [reg] if reg != 'M' else ['H', 'L']
    writes = [reg] if reg != 'M' else []
    
    add(0x04 + (idx << 3), f"INR {reg}", 1, m_cycles, t_states, ['Z', 'S', 'P', 'AC'], "Arithmetic", f"Increment {reg}.", reads, writes, mem_read, mem_write, "Register")
    add(0x05 + (idx << 3), f"DCR {reg}", 1, m_cycles, t_states, ['Z', 'S', 'P', 'AC'], "Arithmetic", f"Decrement {reg}.", reads, writes, mem_read, mem_write, "Register")

for idx, rp in enumerate(pairs):
    add(0x03 + (idx << 4), f"INX {rp}", 1, 1, 6, [], "Arithmetic", f"Increment register pair {rp}.", [rp], [rp], 0, 0, "Register")
    add(0x0B + (idx << 4), f"DCX {rp}", 1, 1, 6, [], "Arithmetic", f"Decrement register pair {rp}.", [rp], [rp], 0, 0, "Register")
    add(0x09 + (idx << 4), f"DAD {rp}", 1, 3, 10, ['CY'], "Arithmetic", f"Add register pair {rp} to HL.", ['H', 'L', rp], ['H', 'L'], 0, 0, "Register")

add(0x27, "DAA", 1, 1, 4, ['Z', 'S', 'P', 'CY', 'AC'], "Arithmetic", "Decimal adjust accumulator.", ['A'], ['A'], 0, 0, "Implied")

# Logical
add(0x2F, "CMA", 1, 1, 4, [], "Logical", "Complement accumulator.", ['A'], ['A'], 0, 0, "Implied")
add(0x3F, "CMC", 1, 1, 4, ['CY'], "Logical", "Complement carry.", [], [], 0, 0, "Implied")
add(0x37, "STC", 1, 1, 4, ['CY'], "Logical", "Set carry.", [], [], 0, 0, "Implied")
add(0x07, "RLC", 1, 1, 4, ['CY'], "Logical", "Rotate accumulator left.", ['A'], ['A'], 0, 0, "Implied")
add(0x0F, "RRC", 1, 1, 4, ['CY'], "Logical", "Rotate accumulator right.", ['A'], ['A'], 0, 0, "Implied")
add(0x17, "RAL", 1, 1, 4, ['CY'], "Logical", "Rotate accumulator left through carry.", ['A'], ['A'], 0, 0, "Implied")
add(0x1F, "RAR", 1, 1, 4, ['CY'], "Logical", "Rotate accumulator right through carry.", ['A'], ['A'], 0, 0, "Implied")

# Branch
add(0xC3, "JMP addr16", 3, 3, 10, [], "Branch", "Unconditional jump.", [], ['PC'], 2, 0, "Immediate")
for idx, cond in enumerate(conditions):
    add(0xC2 + (idx << 3), f"J{cond} addr16", 3, 3, '7/10', [], "Branch", f"Jump if {cond}.", [], ['PC'], 2, 0, "Immediate")

add(0xCD, "CALL addr16", 3, 5, 18, [], "Branch", "Unconditional call.", ['PC', 'SP'], ['PC', 'SP'], 2, 2, "Immediate/Register Indirect")
for idx, cond in enumerate(conditions):
    add(0xC4 + (idx << 3), f"C{cond} addr16", 3, 5, '9/18', [], "Branch", f"Call if {cond}.", ['PC', 'SP'], ['PC', 'SP'], 2, '0/2', "Immediate/Register Indirect")

add(0xC9, "RET", 1, 3, 10, [], "Branch", "Unconditional return.", ['SP'], ['PC', 'SP'], 2, 0, "Register Indirect")
for idx, cond in enumerate(conditions):
    add(0xC0 + (idx << 3), f"R{cond}", 1, 3, '6/12', [], "Branch", f"Return if {cond}.", ['SP'], ['PC', 'SP'], '0/2', 0, "Register Indirect")

for i in range(8):
    add(0xC7 + (i << 3), f"RST {i}", 1, 3, 12, [], "Branch", f"Restart {i}.", ['PC', 'SP'], ['PC', 'SP'], 0, 2, "Implied")

add(0xE9, "PCHL", 1, 1, 6, [], "Branch", "Load PC with HL contents.", ['H', 'L'], ['PC'], 0, 0, "Register")

# Stack, I/O, Machine Control
for idx, rp in enumerate(pairs_push_pop):
    add(0xC5 + (idx << 4), f"PUSH {rp}", 1, 3, 12, [], "Stack", f"Push register pair {rp} onto stack.", [rp, 'SP'], ['SP'], 0, 2, "Register Indirect")
    add(0xC1 + (idx << 4), f"POP {rp}", 1, 3, 10, [], "Stack", f"Pop register pair {rp} from stack.", ['SP'], [rp, 'SP'], 2, 0, "Register Indirect")

add(0xE3, "XTHL", 1, 5, 16, [], "Stack", "Exchange top of stack with HL.", ['H', 'L', 'SP'], ['H', 'L'], 2, 2, "Register Indirect")
add(0xF9, "SPHL", 1, 1, 6, [], "Stack", "Load SP with HL.", ['H', 'L'], ['SP'], 0, 0, "Register")

add(0xDB, "IN port", 2, 3, 10, [], "I/O", "Input from port.", [], ['A'], 1, 0, "Direct")
add(0xD3, "OUT port", 2, 3, 10, [], "I/O", "Output to port.", ['A'], [], 1, 0, "Direct")

add(0xFB, "EI", 1, 1, 4, [], "Machine Control", "Enable interrupts.", [], [], 0, 0, "Implied")
add(0xF3, "DI", 1, 1, 4, [], "Machine Control", "Disable interrupts.", [], [], 0, 0, "Implied")
add(0x76, "HLT", 1, 1, 5, [], "Machine Control", "Halt.", [], [], 0, 0, "Implied")
add(0x00, "NOP", 1, 1, 4, [], "Machine Control", "No operation.", [], [], 0, 0, "Implied")
add(0x20, "RIM", 1, 1, 4, [], "Machine Control", "Read interrupt mask.", [], ['A'], 0, 0, "Implied")
add(0x30, "SIM", 1, 1, 4, [], "Machine Control", "Set interrupt mask.", ['A'], [], 0, 0, "Implied")

output = "export interface InstructionMetadata {\n"
output += "  opcode: string;\n"
output += "  mnemonic: string;\n"
output += "  length: number;\n"
output += "  machineCycles: number;\n"
output += "  tStates: number | string;\n"
output += "  flagsAffected: string[];\n"
output += "  category: string;\n"
output += "  description: string;\n"
output += "  registersRead: string[];\n"
output += "  registersWritten: string[];\n"
output += "  memoryReads: number | string;\n"
output += "  memoryWrites: number | string;\n"
output += "  addressingMode: string;\n"
output += "}\n\n"
output += "export const INSTRUCTION_METADATA: Record<string, InstructionMetadata> = {\n"
for k, v in sorted(metadata.items()):
    output += f"  '{k}': {json.dumps(v)},\n"
output += "};\n"

with open("lib/instruction-metadata.ts", "w") as f:
    f.write(output)
