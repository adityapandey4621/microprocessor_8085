export const challengeData = [
  {
    title: "1. Move an Immediate 8-bit Value to a Register",
    difficulty: "Easy",
    concepts: "Immediate addressing places a constant operand directly inside the instruction. In 8085, MVI A,data is the standard way to load an 8-bit constant into A.",
    description: "Write an 8085 assembly program to load the 8-bit value 5AH into register A. The program should use immediate addressing and must terminate cleanly.",
    instructions: "Input: No preloaded data is required.\nDesired Output / Final State\nOutput: Register A = 5AH.\nTest Cases\nTC1: Initial A=00H \u2192 A=5AH\nTC2: Initial A=FFH \u2192 A=5AH\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Immediate Addressing"
  },
  {
    title: "2. Load Immediate Values into All General-Purpose Registers",
    difficulty: "Easy",
    concepts: "MVI uses immediate addressing. MOV can transfer values between registers, while STA can store A directly; therefore, storing B/C/D/E requires moving each value to A first.",
    description: "Write an 8085 program that loads 12H into B, 34H into C, 56H into D, and 78H into E using immediate addressing. Store each final register value into consecutive memory locations 4000H\u20134003H.",
    instructions: "Input: No preloaded data.\nDesired Output / Final State\nOutput: [4000H]=12H, [4001H]=34H, [4002H]=56H, [4003H]=78H.\nTest Cases\nTC1: All registers initially 00H \u2192 required four memory values.\nTC2: Registers initially FFH \u2192 required values remain unchanged by initialization sequence except where specified.\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Immediate Addressing"
  },
  {
    title: "3. Exchange Two Register Values",
    difficulty: "Easy",
    concepts: "The XCHG instruction exchanges HL and DE, not arbitrary registers. For B and C, use an intermediate register such as A or another available register.",
    description: "Write an 8085 program to exchange the contents of B and C without using any memory location. The initial values are B=25H and C=73H.",
    instructions: "Input: B=25H, C=73H.\nDesired Output / Final State\nOutput: B=73H, C=25H.\nTest Cases\nTC1: B=25H,C=73H \u2192 B=73H,C=25H\nTC2: B=A1H,C=0FH \u2192 B=0FH,C=A1H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Addressing"
  },
  {
    title: "4. Copy a Register to Another Register",
    difficulty: "Easy",
    concepts: "Register addressing operates directly on registers. MOV E,D copies the byte and leaves D unchanged.",
    description: "Write an 8085 program to copy the contents of register D into register E without modifying D.",
    instructions: "Input: D=6BH.\nDesired Output / Final State\nOutput: D=6BH, E=6BH.\nTest Cases\nTC1: D=6BH \u2192 E=6BH\nTC2: D=00H \u2192 E=00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Addressing"
  },
  {
    title: "5. Increment an 8-bit Register",
    difficulty: "Easy",
    concepts: "INR increments an 8-bit register by one. It affects most arithmetic flags but does not affect CY.",
    description: "Write an 8085 program to increment register B by 1. Store the final value of B at memory location 4050H.",
    instructions: "Input: B=2FH.\nDesired Output / Final State\nOutput: B=30H and [4050H]=30H.\nTest Cases\nTC1: B=2FH \u2192 30H\nTC2: B=FFH \u2192 00H; CY remains unchanged by INR.\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "6. Decrement an 8-bit Register",
    difficulty: "Easy",
    concepts: "DCR decrements an 8-bit register. It affects S, Z, AC, and P but does not affect CY.",
    description: "Write an 8085 program to decrement register C by 1 and store the result at 4051H.",
    instructions: "Input: C=40H.\nDesired Output / Final State\nOutput: C=3FH and [4051H]=3FH.\nTest Cases\nTC1: C=40H \u2192 3FH\nTC2: C=00H \u2192 FFH\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "7. Add Two 8-bit Registers",
    difficulty: "Easy",
    concepts: "ADD performs 8-bit addition with A as the implicit destination. The result remains in A and CY indicates an unsigned carry.",
    description: "Write an 8085 program to add the contents of B and C and store the 8-bit result at 4050H. The original B and C values must remain unchanged.",
    instructions: "Input: B=25H, C=17H.\nDesired Output / Final State\nOutput: [4050H]=3CH; B=25H; C=17H.\nTest Cases\nTC1: 25H+17H \u2192 3CH, CY=0\nTC2: F0H+30H \u2192 20H, CY=1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "8. Subtract Two 8-bit Registers",
    difficulty: "Easy",
    concepts: "SUB subtracts the operand from A. The 8085 represents negative 8-bit results using two's complement.",
    description: "Write an 8085 program to calculate B\u2212C and store the 8-bit two's-complement result at 4052H.",
    instructions: "Input: B=35H, C=12H.\nDesired Output / Final State\nOutput: [4052H]=23H.\nTest Cases\nTC1: 35H\u221212H \u2192 23H\nTC2: 12H\u221235H \u2192 DDH\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "9. Bitwise AND of Two Registers",
    difficulty: "Easy",
    concepts: "ANA performs bitwise AND. The result is placed in A and CY is reset.",
    description: "Write an 8085 program to compute B AND C and store the result at 4053H.",
    instructions: "Input: B=5AH, C=3CH.\nDesired Output / Final State\nOutput: [4053H]=18H.\nTest Cases\nTC1: 5AH AND 3CH \u2192 18H\nTC2: FFH AND 00H \u2192 00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "10. Bitwise OR of Two Registers",
    difficulty: "Easy",
    concepts: "ORA performs bitwise OR and places the result in A.",
    description: "Write an 8085 program to compute B OR C and store the result at 4054H.",
    instructions: "Input: B=50H, C=0FH.\nDesired Output / Final State\nOutput: [4054H]=5FH.\nTest Cases\nTC1: 50H OR 0FH \u2192 5FH\nTC2: 00H OR A5H \u2192 A5H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "11. Bitwise XOR of Two Registers",
    difficulty: "Easy",
    concepts: "XRA performs bitwise exclusive OR. XRA A is also commonly used to clear the accumulator.",
    description: "Write an 8085 program to compute B XOR C and store the result at 4055H.",
    instructions: "Input: B=5AH, C=3CH.\nDesired Output / Final State\nOutput: [4055H]=66H.\nTest Cases\nTC1: 5AH XOR 3CH \u2192 66H\nTC2: FFH XOR FFH \u2192 00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "12. Complement the Accumulator",
    difficulty: "Easy",
    concepts: "CMA complements all eight accumulator bits. It does not use another operand.",
    description: "Write an 8085 program to complement every bit of A and store the result at 4056H.",
    instructions: "Input: A=55H.\nDesired Output / Final State\nOutput: [4056H]=AAH.\nTest Cases\nTC1: A=55H \u2192 AAH\nTC2: A=00H \u2192 FFH\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "13. Rotate Accumulator Left",
    difficulty: "Easy",
    concepts: "RLC rotates the accumulator left. Bit 7 moves into bit 0 and also becomes the carry flag.",
    description: "Write an 8085 program to rotate A left by one bit using the 8085 rotate instruction. Store the resulting A at 4057H.",
    instructions: "Input: A=81H.\nDesired Output / Final State\nOutput: A=03H and [4057H]=03H; CY=1.\nTest Cases\nTC1: 81H \u2192 03H, CY=1\nTC2: 40H \u2192 80H, CY=0\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "14. Rotate Accumulator Right",
    difficulty: "Easy",
    concepts: "RRC rotates the accumulator right. Bit 0 moves into bit 7 and also becomes CY.",
    description: "Write an 8085 program to rotate A right by one bit and store the result at 4058H.",
    instructions: "Input: A=01H.\nDesired Output / Final State\nOutput: A=80H and [4058H]=80H; CY=1.\nTest Cases\nTC1: 01H \u2192 80H, CY=1\nTC2: 02H \u2192 01H, CY=0\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "15. Load Data from a Direct Memory Address",
    difficulty: "Easy",
    concepts: "LDA uses direct addressing: the 16-bit memory address is encoded in the instruction.",
    description: "Write an 8085 program to read the byte stored at memory location 4200H into A and store the same byte at 4201H.",
    instructions: "Input: [4200H]=7CH.\nDesired Output / Final State\nOutput: A=7CH and [4201H]=7CH.\nTest Cases\nTC1: [4200H]=7C \u2192 [4201H]=7C\nTC2: [4200H]=00 \u2192 [4201H]=00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Direct Addressing"
  },
  {
    title: "16. Store Accumulator to a Direct Memory Address",
    difficulty: "Easy",
    concepts: "STA uses direct addressing and writes A to the specified 16-bit address.",
    description: "Write an 8085 program to store the accumulator value at memory location 4300H.",
    instructions: "Input: A=9BH.\nDesired Output / Final State\nOutput: [4300H]=9BH.\nTest Cases\nTC1: A=9B \u2192 [4300H]=9B\nTC2: A=00 \u2192 [4300H]=00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Direct Addressing"
  },
  {
    title: "17. Use Register-Indirect Addressing",
    difficulty: "Easy",
    concepts: "MOV A,M uses register-indirect addressing. M means the memory location pointed to by HL.",
    description: "Write an 8085 program to load A with the byte at the memory address contained in HL. The starting HL is 4200H.",
    instructions: "Input: HL=4200H, [4200H]=6EH.\nDesired Output / Final State\nOutput: A=6EH.\nTest Cases\nTC1: HL=4200H,[4200H]=6E \u2192 A=6E\nTC2: HL=42A0H,[42A0H]=FF \u2192 A=FF\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Indirect"
  },
  {
    title: "18. Store Accumulator Using HL",
    difficulty: "Easy",
    concepts: "MOV M,A uses register-indirect addressing. The 16-bit pointer is held in HL.",
    description: "Write an 8085 program that stores A into the memory location pointed to by HL.",
    instructions: "Input: HL=4400H, A=3DH.\nDesired Output / Final State\nOutput: [4400H]=3DH.\nTest Cases\nTC1: HL=4400H,A=3D \u2192 [4400H]=3D\nTC2: HL=44FFH,A=00 \u2192 [44FFH]=00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Indirect"
  },
  {
    title: "19. Compare Two Registers",
    difficulty: "Easy",
    concepts: "CMP subtracts the operand from A only for flag generation; A itself is unchanged. Equality is detected using Z=1.",
    description: "Write an 8085 program to compare B with C without changing B or C. Store 01H at 4059H if B=C, otherwise store 00H.",
    instructions: "Input: B=55H, C=55H.\nDesired Output / Final State\nOutput: [4059H]=01H.\nTest Cases\nTC1: B=55,C=55 \u2192 01H\nTC2: B=55,C=56 \u2192 00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "20. Check Whether a Number Is Even or Odd",
    difficulty: "Easy",
    concepts: "An integer is even when bit 0 is 0. ANI 01H can isolate the least significant bit.",
    description: "Write an 8085 program that examines the byte at 4200H. Store 00H at 4201H if the number is even and 01H if it is odd.",
    instructions: "Input: [4200H]=2AH.\nDesired Output / Final State\nOutput: [4201H]=00H.\nTest Cases\nTC1: 2AH \u2192 even \u2192 00H\nTC2: 37H \u2192 odd \u2192 01H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "21. Check Whether a Number Is Zero",
    difficulty: "Easy",
    concepts: "ORA A is a common zero-test because it leaves A unchanged while setting Z according to whether A is zero.",
    description: "Write an 8085 program to test the byte at 4200H and store 01H at 4201H when it is zero; otherwise store 00H.",
    instructions: "Input: [4200H]=00H.\nDesired Output / Final State\nOutput: [4201H]=01H.\nTest Cases\nTC1: 00H \u2192 01H\nTC2: 08H \u2192 00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "22. Find the Larger of Two 8-bit Numbers",
    difficulty: "Easy",
    concepts: "CMP sets flags without changing A, but conditional jumps can be used after comparing the two values. For unsigned comparison, carry and zero are useful.",
    description: "Write an 8085 program to compare B and C and store the larger unsigned value at 405AH.",
    instructions: "Input: B=45H, C=72H.\nDesired Output / Final State\nOutput: [405AH]=72H.\nTest Cases\nTC1: 45H,72H \u2192 72H\nTC2: A0H,20H \u2192 A0H\nTC3: 55H,55H \u2192 55H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "23. Find the Smaller of Two 8-bit Numbers",
    difficulty: "Easy",
    concepts: "Unsigned comparison can be implemented using CMP followed by JC when the first operand is smaller.",
    description: "Write an 8085 program to compare B and C and store the smaller unsigned value at 405BH.",
    instructions: "Input: B=45H, C=72H.\nDesired Output / Final State\nOutput: [405BH]=45H.\nTest Cases\nTC1: 45H,72H \u2192 45H\nTC2: A0H,20H \u2192 20H\nTC3: 55H,55H \u2192 55H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "24. Count Set Bits in One Byte",
    difficulty: "Easy",
    concepts: "A bit-count loop can repeatedly rotate the value and inspect CY. A counter is incremented whenever a 1 bit is encountered.",
    description: "Write an 8085 program to count the number of 1 bits in the byte stored at 4200H. Store the count at 4201H.",
    instructions: "Input: [4200H]=B3H.\nDesired Output / Final State\nOutput: [4201H]=05H because B3H contains five set bits.\nTest Cases\nTC1: B3H \u2192 05H\nTC2: 00H \u2192 00H\nTC3: FFH \u2192 08H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "25. Count Set Bits Using a Mask",
    difficulty: "Easy",
    concepts: "This problem reinforces logical operations, rotation, carry testing, and looping.",
    description: "Write an 8085 program to count how many of the eight bits in the byte at 4200H are 1. Use a shifting/rotating mask or data value rather than a lookup table.",
    instructions: "Input: [4200H]=F0H.\nDesired Output / Final State\nOutput: [4201H]=04H.\nTest Cases\nTC1: F0H \u2192 04H\nTC2: 0FH \u2192 04H\nTC3: AAH \u2192 04H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "26. Sum Two 8-bit Numbers and Store the Carry",
    difficulty: "Medium",
    concepts: "ADD produces an 8-bit result in A and CY records overflow beyond bit 7.",
    description: "Write an 8085 program to add B and C. Store the low 8-bit sum at 4050H and store 01H at 4051H if an unsigned carry occurs, otherwise 00H.",
    instructions: "Input: B=F5H, C=22H.\nDesired Output / Final State\nOutput: [4050H]=17H, [4051H]=01H.\nTest Cases\nTC1: F5+22 \u2192 17, carry=1\nTC2: 20+30 \u2192 50, carry=0\nTC3: FF+01 \u2192 00, carry=1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "27. 16-bit Addition Using BC and DE",
    difficulty: "Medium",
    concepts: "DAD adds a register pair to HL. Therefore, the common approach is to copy one 16-bit operand into HL and execute DAD on the other pair. CY records a 16-bit carry.",
    description: "Write an 8085 program to add the 16-bit values in BC and DE. The result must be placed in HL and also stored at 4050H\u20134051H, low byte first. Preserve the original BC and DE values.",
    instructions: "Input: BC=1234H, DE=0102H.\nDesired Output / Final State\nOutput: HL=1336H; [4050H]=36H; [4051H]=13H.\nTest Cases\nTC1: 1234+0102 \u2192 1336\nTC2: FFFF+0001 \u2192 0000, CY=1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Arithmetic & Flags"
  },
  {
    title: "28. 16-bit Subtraction",
    difficulty: "Medium",
    concepts: "8085 has no direct 16-bit SUB instruction. Subtraction must be performed byte by byte, using SUB for the low byte and SBB for the high byte after managing the borrow.",
    description: "Write an 8085 program to calculate the unsigned 16-bit value BC\u2212DE and store the result at 4050H\u20134051H, low byte first. Assume BC\u2265DE.",
    instructions: "Input: BC=4567H, DE=1234H.\nDesired Output / Final State\nOutput: [4050H]=33H, [4051H]=33H.\nTest Cases\nTC1: 4567\u22121234 \u2192 3333\nTC2: 1000\u22120001 \u2192 0FFF\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Logical Operations"
  },
  {
    title: "29. Add Two Memory Bytes",
    difficulty: "Medium",
    concepts: "LDA/STA demonstrate direct addressing. Carry must be explicitly converted into a storable byte.",
    description: "Write an 8085 program to add the bytes at 4200H and 4201H. Store the 8-bit result at 4202H and the carry indicator (00H/01H) at 4203H.",
    instructions: "Input: [4200H]=8AH, [4201H]=91H.\nDesired Output / Final State\nOutput: [4202H]=1BH, [4203H]=01H.\nTest Cases\nTC1: 8A+91 \u2192 1B, carry=1\nTC2: 10+20 \u2192 30, carry=0\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "16-bit Operations"
  },
  {
    title: "30. Sum N Bytes in Memory",
    difficulty: "Medium",
    concepts: "A repeated addition loop can use HL as a memory pointer and a register as the loop counter. Since repeated additions may overflow many times, the carry count must be accumulated separately.",
    description: "Write an 8085 program to sum N unsigned 8-bit numbers stored consecutively starting at 4201H. N is stored at 4200H. Store the low 8-bit sum at 4300H and the final carry count at 4301H.",
    instructions: "Input: N=04H; data=10H,20H,30H,40H.\nDesired Output / Final State\nOutput: [4300H]=A0H, [4301H]=00H.\nTest Cases\nTC1: 4 values 10,20,30,40 \u2192 A0,00\nTC2: 2 values FF,01 \u2192 00,01\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "31. Find Maximum in an Array",
    difficulty: "Medium",
    concepts: "The algorithm keeps a current maximum, compares each subsequent element using CMP, and updates the maximum when required.",
    description: "Write an 8085 program to find the largest unsigned byte in an array. N is stored at 4200H and the N elements begin at 4201H. Store the maximum at 4300H.",
    instructions: "Input: N=05H; array=12H,7FH,34H,22H,55H.\nDesired Output / Final State\nOutput: [4300H]=7FH.\nTest Cases\nTC1: 12,7F,34,22,55 \u2192 7F\nTC2: 05,01,02,03,04 \u2192 05\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Indirect"
  },
  {
    title: "32. Find Minimum in an Array",
    difficulty: "Medium",
    concepts: "This is the inverse of maximum search: retain the current minimum and replace it whenever a smaller unsigned element is found.",
    description: "Write an 8085 program to find the smallest unsigned byte in an array. N is at 4200H and the array begins at 4201H. Store the minimum at 4300H.",
    instructions: "Input: N=05H; array=32H,17H,A0H,05H,44H.\nDesired Output / Final State\nOutput: [4300H]=05H.\nTest Cases\nTC1: 32,17,A0,05,44 \u2192 05\nTC2: 03,03,03 \u2192 03\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Register Indirect"
  },
  {
    title: "33. Copy an Array to Another Memory Block",
    difficulty: "Medium",
    concepts: "Register-indirect addressing with HL and DE allows traversal of source and destination blocks. The counter can be maintained in B.",
    description: "Write an 8085 program to copy N bytes from the block beginning at 4200H to the block beginning at 4300H. N is stored at 41FFH.",
    instructions: "Input: [41FFH]=04H; source=11H,22H,33H,44H.\nDesired Output / Final State\nOutput: [4300H..4303H]=11H,22H,33H,44H.\nTest Cases\nTC1: 4 bytes \u2192 identical destination block\nTC2: N=01H \u2192 only first byte copied\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "34. Swap Two Memory Bytes",
    difficulty: "Medium",
    concepts: "Memory cannot be directly exchanged by a single instruction. Load one value, temporarily preserve it, load the second value, then write both values back.",
    description: "Write an 8085 program to exchange the contents of memory locations 4200H and 4201H using the accumulator and register-indirect addressing.",
    instructions: "Input: [4200H]=12H, [4201H]=A5H.\nDesired Output / Final State\nOutput: [4200H]=A5H, [4201H]=12H.\nTest Cases\nTC1: 12/A5 \u2192 A5/12\nTC2: 00/FF \u2192 FF/00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "35. Reverse an Array In Place",
    difficulty: "Medium",
    concepts: "Two pointers can move from the beginning and end toward the center. Since 8085 has limited registers, pointer manipulation and temporary storage must be planned carefully.",
    description: "Write an 8085 program to reverse N bytes stored from 4200H onward without using a second array. Store the reversed sequence in the same locations.",
    instructions: "Input: N=05H; [4200H..4204H]=10H,20H,30H,40H,50H.\nDesired Output / Final State\nOutput: 50H,40H,30H,20H,10H in the same block.\nTest Cases\nTC1: 10,20,30,40,50 \u2192 50,40,30,20,10\nTC2: 11,22,33,44 \u2192 44,33,22,11\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "36. Count Occurrences of a Value",
    difficulty: "Medium",
    concepts: "Each element is compared with the target. The count is incremented when the zero flag indicates equality.",
    description: "Write an 8085 program to count how many times a target byte occurs in an array. N is at 4200H, target at 4201H, and the array begins at 4202H. Store the count at 4300H.",
    instructions: "Input: N=06H, target=22H, array=11H,22H,33H,22H,44H,22H.\nDesired Output / Final State\nOutput: [4300H]=03H.\nTest Cases\nTC1: target 22 in 6 elements \u2192 03\nTC2: target FF absent \u2192 00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "37. Separate Even and Odd Numbers",
    difficulty: "Medium",
    concepts: "ANI 01H can test parity, but the original value must be preserved before masking. Two destination pointers are required.",
    description: "Write an 8085 program to scan N bytes starting at 4201H. Store even numbers beginning at 4300H and odd numbers beginning at 4400H. N is at 4200H.",
    instructions: "Input: N=05H; array=10H,11H,22H,33H,44H.\nDesired Output / Final State\nOutput: even block=10H,22H,44H; odd block=11H,33H.\nTest Cases\nTC1: above input \u2192 3 even and 2 odd\nTC2: all even \u2192 odd block receives no new values\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Comparison & Conditional"
  },
  {
    title: "38. Multiply an 8-bit Number by 2",
    difficulty: "Medium",
    concepts: "Doubling can be implemented as ADD A,A or RLC. RLC also exposes the discarded high bit through CY.",
    description: "Write an 8085 program to multiply the byte at 4200H by 2 using only addition or rotation instructions. Store the low byte at 4201H and carry at 4202H.",
    instructions: "Input: [4200H]=85H.\nDesired Output / Final State\nOutput: [4201H]=0AH, [4202H]=01H.\nTest Cases\nTC1: 85H\u00d72 \u2192 0A, carry=1\nTC2: 40H\u00d72 \u2192 80, carry=0\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "39. Multiply by 10 Without MUL",
    difficulty: "Medium",
    concepts: "8085 has no MUL instruction. Multiplication can be constructed from shifts/additions, such as x\u00d710 = x\u00d78 + x\u00d72.",
    description: "Write an 8085 program to multiply an 8-bit unsigned number at 4200H by 10 without using a multiplication instruction. Store the 16-bit result at 4300H\u20134301H, low byte first.",
    instructions: "Input: [4200H]=12H.\nDesired Output / Final State\nOutput: 120 decimal = 0078H, so [4300H]=78H and [4301H]=00H.\nTest Cases\nTC1: 12H (18) \u00d710 \u2192 0078H\nTC2: 20H (32) \u00d710 \u2192 0140H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "40. Divide an 8-bit Number by 2",
    difficulty: "Medium",
    concepts: "RRC shifts the bits right while moving bit 0 into CY. CY therefore gives the remainder when dividing an unsigned integer by 2.",
    description: "Write an 8085 program to divide the unsigned byte at 4200H by 2 using a rotate instruction. Store the quotient at 4201H and the remainder at 4202H.",
    instructions: "Input: [4200H]=35H.\nDesired Output / Final State\nOutput: quotient=1AH, remainder=01H.\nTest Cases\nTC1: 35H \u2192 1A quotient, 1 remainder\nTC2: 40H \u2192 20 quotient, 0 remainder\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "16-bit Operations"
  },
  {
    title: "41. Generate the Two's Complement",
    difficulty: "Medium",
    concepts: "Two's complement is obtained by complementing all bits and adding one: NOT(x)+1. CMA and INR are useful here.",
    description: "Write an 8085 program to generate the two's complement of the byte at 4200H and store it at 4201H.",
    instructions: "Input: [4200H]=25H.\nDesired Output / Final State\nOutput: [4201H]=DBH.\nTest Cases\nTC1: 25H \u2192 DBH\nTC2: 00H \u2192 00H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "42. Check Whether Two Bytes Are Equal",
    difficulty: "Medium",
    concepts: "CMP can compare values by setting flags without retaining the subtraction result. Z=1 means equality.",
    description: "Write an 8085 program to compare the bytes at 4200H and 4201H. Store 01H at 4202H if they are equal and 00H otherwise.",
    instructions: "Input: [4200H]=ABH, [4201H]=ABH.\nDesired Output / Final State\nOutput: [4202H]=01H.\nTest Cases\nTC1: AB/AB \u2192 01\nTC2: AB/AC \u2192 00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "43. Find the Number of Zeros in an Array",
    difficulty: "Medium",
    concepts: "Each element can be tested with ORA A or CPI 00H. The counter increments when Z=1.",
    description: "Write an 8085 program to count how many elements in an N-byte array are zero. N is at 4200H and the array starts at 4201H. Store the count at 4300H.",
    instructions: "Input: N=07H; array=00H,12H,00H,00H,44H,55H,00H.\nDesired Output / Final State\nOutput: [4300H]=04H.\nTest Cases\nTC1: four zeros \u2192 04\nTC2: no zeros \u2192 00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "44. Sum Only Even Elements",
    difficulty: "Medium",
    concepts: "Parity can be checked from bit 0. Only elements whose least significant bit is zero participate in the addition.",
    description: "Write an 8085 program to sum only even numbers in an N-byte array. N is at 4200H and data begins at 4201H. Store the 8-bit sum at 4300H.",
    instructions: "Input: N=05H; array=11H,20H,31H,04H,10H.\nDesired Output / Final State\nOutput: 20H+04H+10H=34H, so [4300H]=34H.\nTest Cases\nTC1: 11,20,31,04,10 \u2192 34\nTC2: all odd \u2192 00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "45. 16-bit Addition with Carry Stored Separately",
    difficulty: "Hard",
    concepts: "DAD works on 16-bit register pairs and sets CY when the sum exceeds FFFFH. Preserving operands requires copies before DAD.",
    description: "Write an 8085 program to add BC and DE. Store the 16-bit result at 4050H\u20134051H, low byte first, and store the final carry at 4052H. BC and DE must remain unchanged.",
    instructions: "Input: BC=F234H, DE=20F0H.\nDesired Output / Final State\nOutput: sum=1324H, carry=1; [4050H]=24H, [4051H]=13H, [4052H]=01H.\nTest Cases\nTC1: F234+20F0 \u2192 1324, carry=1\nTC2: 1000+2000 \u2192 3000, carry=0\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Loops & Arrays"
  },
  {
    title: "46. 16-bit Array Sum",
    difficulty: "Hard",
    concepts: "Each 16-bit element occupies two bytes. The algorithm must advance the pointer by two and add low/high bytes while propagating carry.",
    description: "Write an 8085 program to sum N unsigned 16-bit numbers stored consecutively in little-endian form beginning at 4200H. N is stored at 41FFH. Store the 16-bit low result at 4300H\u20134301H and an overflow count at 4302H.",
    instructions: "Input: N=03H; values=1000H,2000H,3000H.\nDesired Output / Final State\nOutput: sum=6000H; [4300H]=00H, [4301H]=60H, [4302H]=00H.\nTest Cases\nTC1: 1000,2000,3000 \u2192 6000\nTC2: FFFF,0001 \u2192 0000 with overflow count=1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "47. BCD Addition of Two Packed BCD Bytes",
    difficulty: "Hard",
    concepts: "DAA adjusts the accumulator after binary addition so that the result becomes a valid packed BCD value. The carry after DAA represents a decimal carry.",
    description: "Write an 8085 program to add two packed BCD numbers stored at 4200H and 4201H. Store the packed BCD result at 4202H and the decimal carry at 4203H.",
    instructions: "Input: [4200H]=45H, [4201H]=38H.\nDesired Output / Final State\nOutput: [4202H]=83H, [4203H]=00H.\nTest Cases\nTC1: 45+38 BCD \u2192 83\nTC2: 75+50 BCD \u2192 25 with carry=1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "16-bit Operations"
  },
  {
    title: "48. BCD Subtraction with Borrow",
    difficulty: "Hard",
    concepts: "8085 does not provide a direct BCD subtraction instruction. Decimal subtraction can be implemented using ten's complement techniques or carefully managed borrow logic.",
    description: "Write an 8085 program to subtract packed BCD number at 4201H from the packed BCD number at 4200H, assuming the first value is greater or equal. Store the packed BCD result at 4202H.",
    instructions: "Input: [4200H]=75H, [4201H]=28H.\nDesired Output / Final State\nOutput: [4202H]=47H.\nTest Cases\nTC1: 75\u221228 BCD \u2192 47\nTC2: 90\u221225 BCD \u2192 65\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "16-bit Operations"
  },
  {
    title: "49. Bubble Sort an Array in Ascending Order",
    difficulty: "Hard",
    concepts: "Bubble sort repeatedly compares adjacent elements and swaps them when they are out of order. CMP and conditional jumps implement the comparison.",
    description: "Write an 8085 program to sort N unsigned bytes stored from 4201H onward in ascending order. N is at 4200H. Sort the array in place.",
    instructions: "Input: N=05H; array=32H,10H,45H,01H,20H.\nDesired Output / Final State\nOutput: 01H,10H,20H,32H,45H at 4201H\u20134205H.\nTest Cases\nTC1: 32,10,45,01,20 \u2192 01,10,20,32,45\nTC2: already sorted \u2192 unchanged\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "BCD"
  },
  {
    title: "50. Binary Search in a Sorted Array",
    difficulty: "Hard",
    concepts: "Binary search repeatedly divides the search range in half. It is more complex in 8085 because midpoint arithmetic and indexed memory access must be implemented manually.",
    description: "Write an 8085 program to search for a target byte in a sorted ascending array. N is at 4200H, target at 4201H, and array begins at 4202H. Store 01H at 4300H if found and 00H otherwise.",
    instructions: "Input: N=07H, target=40H, array=10H,20H,30H,40H,50H,60H,70H.\nDesired Output / Final State\nOutput: [4300H]=01H.\nTest Cases\nTC1: target present \u2192 01\nTC2: target=41H absent \u2192 00\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "BCD"
  },
  {
    title: "51. Find Second Largest Distinct Element",
    difficulty: "Hard",
    concepts: "Two running values\u2014largest and second largest\u2014must be maintained. Equal values must not incorrectly replace the second-largest distinct value.",
    description: "Write an 8085 program to find the second-largest distinct unsigned byte in an array. N is at 4200H and data begins at 4201H. Store the result at 4300H. Assume at least two distinct values exist.",
    instructions: "Input: N=06H; array=20H,50H,50H,10H,40H,30H.\nDesired Output / Final State\nOutput: [4300H]=40H.\nTest Cases\nTC1: 20,50,50,10,40,30 \u2192 40\nTC2: 05,04,03,03,02 \u2192 04\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "52. Remove Duplicate Values from an Array",
    difficulty: "Hard",
    concepts: "For each element, compare it with the already accepted portion. If it is new, append it to the compacted region. This requires nested loops and careful pointer management.",
    description: "Write an 8085 program to remove duplicate values from an array of N bytes. N is at 4200H and data starts at 4201H. Compact only the first occurrences in place and store the new length at 4300H.",
    instructions: "Input: N=06H; array=10H,20H,10H,30H,20H,40H.\nDesired Output / Final State\nOutput: [4300H]=04H; compacted data=10H,20H,30H,40H.\nTest Cases\nTC1: above \u2192 length 4\nTC2: 01,01,01 \u2192 length 1\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "53. 16-bit Increment of a Memory-Stored Number",
    difficulty: "Hard",
    concepts: "A 16-bit increment requires incrementing the low byte and propagating a carry to the high byte when the low byte wraps from FFH to 00H.",
    description: "Write an 8085 program to increment a 16-bit little-endian number stored at 4200H (low byte) and 4201H (high byte). Store the result back in the same locations.",
    instructions: "Input: [4200H]=FFH, [4201H]=12H.\nDesired Output / Final State\nOutput: [4200H]=00H, [4201H]=13H.\nTest Cases\nTC1: 12FFH \u2192 1300H\nTC2: FFFFH \u2192 0000H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "54. 16-bit Decrement of a Memory-Stored Number",
    difficulty: "Hard",
    concepts: "If the low byte is zero, decrementing it requires setting it to FFH and decrementing the high byte.",
    description: "Write an 8085 program to decrement a 16-bit little-endian number stored at 4200H\u20134201H and write it back.",
    instructions: "Input: [4200H]=00H, [4201H]=13H.\nDesired Output / Final State\nOutput: [4200H]=FFH, [4201H]=12H.\nTest Cases\nTC1: 1300H \u2192 12FFH\nTC2: 0000H \u2192 FFFFH\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "55. Multiply Two 8-bit Numbers Using Repeated Addition",
    difficulty: "Hard",
    concepts: "Repeated addition demonstrates loops, counters, carry handling, and 16-bit accumulation. No MUL instruction is available in the 8085 instruction set.",
    description: "Write an 8085 program to multiply the unsigned bytes at 4200H and 4201H using repeated addition only. Store the 16-bit product at 4300H\u20134301H, low byte first.",
    instructions: "Input: [4200H]=12H, [4201H]=05H.\nDesired Output / Final State\nOutput: product=005AH; [4300H]=5AH, [4301H]=00H.\nTest Cases\nTC1: 12\u00d705 \u2192 005A\nTC2: FF\u00d702 \u2192 01FE\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "56. Calculate Factorial of an 8-bit Number",
    difficulty: "Hard",
    concepts: "Factorial requires repeated multiplication. Since 8085 has no multiplication instruction, multiplication must be implemented through repeated addition or a suitable shift/add routine.",
    description: "Write an 8085 program to calculate the factorial of N, where N is stored at 4200H. Store the 16-bit result at 4300H\u20134301H. Assume N\u226405H.",
    instructions: "Input: N=05H.\nDesired Output / Final State\nOutput: 5! = 120 = 0078H; [4300H]=78H, [4301H]=00H.\nTest Cases\nTC1: N=00 \u2192 0001H\nTC2: N=05 \u2192 0078H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "57. Compute the GCD of Two 8-bit Numbers",
    difficulty: "Hard",
    concepts: "Euclid's algorithm repeatedly replaces (a,b) with (b,a mod b). Because 8085 has no division instruction, the remainder can be generated through repeated subtraction.",
    description: "Write an 8085 program to calculate the greatest common divisor of the bytes at 4200H and 4201H using Euclid's algorithm. Store the GCD at 4300H.",
    instructions: "Input: [4200H]=48H, [4201H]=18H.\nDesired Output / Final State\nOutput: [4300H]=18H.\nTest Cases\nTC1: 48H,18H \u2192 18H\nTC2: 21H,0FH \u2192 03H\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "58. Compute the LCM Using GCD",
    difficulty: "Hard",
    concepts: "LCM(a,b) = (a\u00d7b)/GCD(a,b). The implementation combines multiplication, GCD, and division/repeated subtraction concepts.",
    description: "Write an 8085 program to calculate the LCM of two 8-bit positive integers at 4200H and 4201H. Store the 16-bit LCM at 4300H\u20134301H.",
    instructions: "Input: a=12H (18), b=08H (8).\nDesired Output / Final State\nOutput: LCM=72 decimal=0048H.\nTest Cases\nTC1: 18 and 8 \u2192 72\nTC2: 6 and 4 \u2192 12\nEvaluation Notes\nThe evaluator should primarily inspect the required final memory/register state. Intermediate register usage should not be restricted unless the statement explicitly requires preservation.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "51. Load a 16-bit Address into HL",
    difficulty: "Easy",
    concepts: "LXI H loads a 16-bit immediate address into HL.",
    description: "Write an 8085 program to load 5200H into HL using a 16-bit immediate instruction.",
    instructions: "Input: none.\nDesired Output / Final State\nOutput: HL=5200H.\nTest Cases\n0000H\u21925200H\nFFFFH\u21925200H\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "52. Load a 16-bit Value into BC",
    difficulty: "Easy",
    concepts: "LXI B loads a complete 16-bit immediate value.",
    description: "Write an 8085 program to load 1234H into BC without using two separate 8-bit loads.",
    instructions: "Input: none.\nDesired Output / Final State\nOutput: B=12H,C=34H.\nTest Cases\n0000H\u21921234H\nFFFFH\u21921234H\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "53. Copy HL into DE",
    difficulty: "Easy",
    concepts: "8085 has no pair-to-pair MOV; transfer high and low bytes separately.",
    description: "Write an 8085 program to copy HL into DE without changing HL.",
    instructions: "Input: HL=3A7FH.\nDesired Output / Final State\nOutput: HL=DE=3A7FH.\nTest Cases\n3A7F\u21923A7F\n0000\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "54. Store a 16-bit Value in Memory",
    difficulty: "Easy",
    concepts: "16-bit memory values use low byte first.",
    description: "Store 5678H at 5200H in little-endian order.",
    instructions: "Input: none.\nDesired Output / Final State\nOutput: [5200]=78H,[5201]=56H.\nTest Cases\n5678\u219278,56\n00A5\u2192A5,00\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "55. Read a 16-bit Value from Memory",
    difficulty: "Easy",
    concepts: "Read low and high bytes and assemble them into HL.",
    description: "Read a little-endian 16-bit value from 5200H\u20135201H into HL.",
    instructions: "Input: [5200]=34H,[5201]=12H.\nDesired Output / Final State\nOutput: HL=1234H.\nTest Cases\n34,12\u21921234\nFF,00\u219200FF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "56. Exchange HL and DE",
    difficulty: "Easy",
    concepts: "XCHG exchanges HL and DE directly.",
    description: "Exchange HL and DE using the dedicated 8085 instruction.",
    instructions: "Input: HL=1234H,DE=ABCDH.\nDesired Output / Final State\nOutput: HL=ABCDH,DE=1234H.\nTest Cases\n1234/ABCD\u2192ABCD/1234\n0000/FFFF\u2192FFFF/0000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "57. Increment a Register Pair",
    difficulty: "Easy",
    concepts: "INX H increments HL and does not affect flags.",
    description: "Increment HL by one using a register-pair instruction.",
    instructions: "Input: HL=12FFH.\nDesired Output / Final State\nOutput: HL=1300H.\nTest Cases\n12FF\u21921300\nFFFF\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "58. Decrement a Register Pair",
    difficulty: "Easy",
    concepts: "DCX B decrements BC without affecting flags.",
    description: "Decrement BC by one.",
    instructions: "Input: BC=1200H.\nDesired Output / Final State\nOutput: BC=11FFH.\nTest Cases\n1200\u219211FF\n0000\u2192FFFF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "Advanced Algorithms"
  },
  {
    title: "59. Add BC to HL",
    difficulty: "Easy",
    concepts: "DAD B performs HL\u2190HL+BC and sets CY on 16-bit overflow.",
    description: "Add BC to HL and leave the result in HL.",
    instructions: "Input: HL=1234H,BC=0102H.\nDesired Output / Final State\nOutput: HL=1336H.\nTest Cases\n1234+0102\u21921336\nFFFF+0001\u21920000,CY=1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "60. Clear A Using XRA",
    difficulty: "Easy",
    concepts: "XRA A produces zero because a value XOR itself is zero.",
    description: "Clear A without MVI A,00H or SUB A.",
    instructions: "Input: A can contain any byte.\nDesired Output / Final State\nOutput: A=00H.\nTest Cases\n5A\u219200\nFF\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "61. Create FFH Using Logic",
    difficulty: "Easy",
    concepts: "XRA A followed by CMA can synthesize FFH.",
    description: "Make A=FFH without MVI A,FFH.",
    instructions: "Input: any A.\nDesired Output / Final State\nOutput: A=FFH.\nTest Cases\n00\u2192FF\n55\u2192FF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "62. Mask Lower Nibble",
    difficulty: "Easy",
    concepts: "ANI 0FH clears the upper nibble.",
    description: "Keep only the lower four bits of [5200H] and store them at 5201H.",
    instructions: "Input: [5200]=ABH.\nDesired Output / Final State\nOutput: [5201]=0BH.\nTest Cases\nAB\u21920B\nF7\u219207\n00\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "63. Mask Upper Nibble",
    difficulty: "Easy",
    concepts: "ANI F0H clears the lower nibble.",
    description: "Keep only the upper four bits of [5200H] and store them at 5201H.",
    instructions: "Input: [5200]=ABH.\nDesired Output / Final State\nOutput: [5201]=A0H.\nTest Cases\nAB\u2192A0\n3F\u219230\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "64. Test Bit 7",
    difficulty: "Easy",
    concepts: "ANI 80H isolates the most significant bit.",
    description: "Store 01H at 5201H if bit 7 of [5200H] is set, else 00H.",
    instructions: "Input: [5200]=92H.\nDesired Output / Final State\nOutput: [5201]=01H.\nTest Cases\n92\u219201\n12\u219200\nFF\u219201\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "65. Test Bit 0",
    difficulty: "Easy",
    concepts: "ANI 01H isolates the least significant bit.",
    description: "Store 01H if bit 0 of [5200H] is set, else 00H.",
    instructions: "Input: [5200]=37H.\nDesired Output / Final State\nOutput: [5201]=01H.\nTest Cases\n37\u219201\n36\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "66. Swap the Nibbles of A",
    difficulty: "Easy",
    concepts: "Four single-bit rotations can exchange the two nibbles.",
    description: "Swap the upper and lower nibbles of A; for example 3CH\u2192C3H.",
    instructions: "Input: A=3CH.\nDesired Output / Final State\nOutput: A=C3H.\nTest Cases\n3C\u2192C3\nA5\u21925A\n00\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "67. Clear a Memory Location",
    difficulty: "Easy",
    concepts: "8085 uses A as an intermediary because MVI M,data is unavailable.",
    description: "Set [5200H] to 00H without using an immediate-to-memory instruction.",
    instructions: "Input: [5200] arbitrary.\nDesired Output / Final State\nOutput: [5200]=00H.\nTest Cases\nFF\u219200\n55\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "68. Fill Three Consecutive Locations",
    difficulty: "Easy",
    concepts: "HL can be used with MOV M,A and INX H.",
    description: "Store 11H,22H,33H at 5200H,5201H,5202H using a pointer.",
    instructions: "Input: none.\nDesired Output / Final State\nOutput: 11,22,33.\nTest Cases\narbitrary\u219211,22,33\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "69. Count Down an 8-bit Register",
    difficulty: "Easy",
    concepts: "DCR and conditional branching implement a counter loop.",
    description: "Decrement B until it reaches zero and store the number of decrements at 5200H.",
    instructions: "Input: B=0AH.\nDesired Output / Final State\nOutput: B=00H,[5200]=0AH.\nTest Cases\n0A\u2192count 0A\n01\u2192count 01\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "70. Generate 1 to N",
    difficulty: "Easy",
    concepts: "A loop counter and HL pointer generate consecutive values.",
    description: "Generate 01H through NH starting at 5200H; N is at 51FFH.",
    instructions: "Input: [51FF]=05H.\nDesired Output / Final State\nOutput: 01,02,03,04,05.\nTest Cases\nN=5\u219201..05\nN=1\u219201\nN=0\u2192none\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "71. Add Two 16-bit Numbers in Memory",
    difficulty: "Medium",
    concepts: "Combines memory addressing, register pairs, DAD and carry detection.",
    description: "Add little-endian values at 5200H\u20135201H and 5202H\u20135203H; store the 16-bit result at 5204H\u20135205H and carry at 5206H.",
    instructions: "Input: 1234H and 0102H.\nDesired Output / Final State\nOutput: 1336H, carry 00H.\nTest Cases\n1234+0102\u21921336,0\nFFFF+0001\u21920000,1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "72. Subtract Two 16-bit Numbers",
    difficulty: "Medium",
    concepts: "Use SUB for the low byte and SBB for the high byte to propagate borrow.",
    description: "Calculate A\u2212B for little-endian values at 5200H\u20135203H, assuming A\u2265B.",
    instructions: "Input: A=4567H,B=1234H.\nDesired Output / Final State\nOutput: 3333H at 5204H\u20135205H.\nTest Cases\n4567\u22121234\u21923333\n1000\u22120001\u21920FFF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "73. Find 16-bit Maximum",
    difficulty: "Medium",
    concepts: "Compare high bytes first, then low bytes if high bytes are equal.",
    description: "Compare two unsigned 16-bit values in memory and store the larger at 5204H\u20135205H.",
    instructions: "Input: 4520H and 37FFH.\nDesired Output / Final State\nOutput: 4520H.\nTest Cases\n4520/37FF\u21924520\n1200/12FF\u219212FF\nequal\u2192same\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "74. Find 16-bit Minimum",
    difficulty: "Medium",
    concepts: "16-bit comparison requires correct high-byte and low-byte ordering.",
    description: "Compare two unsigned 16-bit values and store the smaller.",
    instructions: "Input: 4520H and 37FFH.\nDesired Output / Final State\nOutput: 37FFH.\nTest Cases\n4520/37FF\u219237FF\n1200/12FF\u21921200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "75. Generate First N Even Numbers",
    difficulty: "Medium",
    concepts: "Each iteration adds two to the current value.",
    description: "Generate 00H,02H,04H,... for N elements starting at 5200H.",
    instructions: "Input: N=05H at 51FFH.\nDesired Output / Final State\nOutput: 00,02,04,06,08.\nTest Cases\nN=5\u219200..08\nN=1\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "76. Generate First N Odd Numbers",
    difficulty: "Medium",
    concepts: "An odd sequence advances by two.",
    description: "Generate 01H,03H,05H,... for N elements.",
    instructions: "Input: N=05H.\nDesired Output / Final State\nOutput: 01,03,05,07,09.\nTest Cases\nN=5\u219201..09\nN=1\u219201\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "77. Sum 1 to N",
    difficulty: "Medium",
    concepts: "Repeated addition demonstrates loops and multi-byte accumulation.",
    description: "Calculate 1+2+...+N and store the 16-bit result at 5201H\u20135202H.",
    instructions: "Input: N=0AH.\nDesired Output / Final State\nOutput: 0037H.\nTest Cases\n10\u21920037\n1\u21920001\n0\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "78. Sum Only Odd Numbers to N",
    difficulty: "Medium",
    concepts: "Maintain the current odd number and add two each iteration.",
    description: "Calculate 1+3+5... up to the largest odd \u2264N.",
    instructions: "Input: N=09H.\nDesired Output / Final State\nOutput: 0019H.\nTest Cases\n9\u21920019\n8\u21920010\n0\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "79. Count Values Greater Than Threshold",
    difficulty: "Medium",
    concepts: "CMP and unsigned conditional branching implement the comparison.",
    description: "Count array elements strictly greater than a threshold. N at 5200H, threshold at 5201H, array at 5202H.",
    instructions: "Input: N=6, threshold=30H; 10,31,30,50,20,40.\nDesired Output / Final State\nOutput: [5300]=03H.\nTest Cases\nabove input\u21923\nall equal\u21920\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "80. Count Values Less Than Threshold",
    difficulty: "Medium",
    concepts: "JC after CMP can identify unsigned less-than.",
    description: "Count array elements strictly less than a threshold.",
    instructions: "Input: N=6, threshold=30H; 10,31,30,50,20,40.\nDesired Output / Final State\nOutput: [5300]=02H.\nTest Cases\nabove input\u21922\nall below\u2192N\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "81. Integer Average of N Bytes",
    difficulty: "Medium",
    concepts: "Accumulate in 16 bits, then divide by N using repeated subtraction.",
    description: "Calculate the integer average of N unsigned bytes; ignore remainder.",
    instructions: "Input: 4 values 10H,20H,30H,40H.\nDesired Output / Final State\nOutput: [5300]=28H.\nTest Cases\n16,32,48,64\u219240 decimal\n3,4,5\u21924\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "82. Average and Remainder",
    difficulty: "Medium",
    concepts: "Repeated subtraction gives quotient and remainder without hardware division.",
    description: "Calculate sum/N and sum mod N for an array. Store quotient at 5300H and remainder at 5301H.",
    instructions: "Input: 05H,06H,07H; N=3.\nDesired Output / Final State\nOutput: quotient=06H,remainder=00H.\nTest Cases\n5,6,7\u21926,0\n1,2\u21921,1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "83. First Occurrence Search",
    difficulty: "Medium",
    concepts: "Linear search stops at the first match.",
    description: "Find the zero-based index of target in an array; store FFH if absent.",
    instructions: "Input: target=30H; array=10,30,20,30,40.\nDesired Output / Final State\nOutput: index 01H.\nTest Cases\ntarget\u219201\nabsent\u2192FF\nfirst\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "84. Last Occurrence Search",
    difficulty: "Medium",
    concepts: "Continue scanning after matches and update the saved index.",
    description: "Find the zero-based index of the last target occurrence.",
    instructions: "Input: target=30H; array=10,30,20,30,40.\nDesired Output / Final State\nOutput: index 03H.\nTest Cases\nabove\u219203\nabsent\u2192FF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "85. Reverse Bits of a Byte",
    difficulty: "Medium",
    concepts: "Repeated rotations and a result accumulator can reverse bit order.",
    description: "Reverse all eight bits of [5200H] and store the result at 5201H.",
    instructions: "Input: 16H.\nDesired Output / Final State\nOutput: 68H.\nTest Cases\n16\u219268\n80\u219201\nFF\u2192FF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "86. Count Leading Zeros",
    difficulty: "Medium",
    concepts: "Rotate left and inspect the outgoing MSB until a one is found.",
    description: "Count consecutive zero bits from bit 7; for 00H return 08H.",
    instructions: "Input: 10H.\nDesired Output / Final State\nOutput: 03H.\nTest Cases\n10\u21923\n80\u21920\n00\u21928\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "87. Unsigned Division by Repeated Subtraction",
    difficulty: "Medium",
    concepts: "Repeated subtraction implements division without a DIV instruction.",
    description: "Divide [5200H] by [5201H]; store quotient at 5300H and remainder at 5301H.",
    instructions: "Input: 35H/06H.\nDesired Output / Final State\nOutput: quotient=08H,remainder=05H.\nTest Cases\n53/6\u21928,5\n20/5\u21924,0\n4/7\u21920,4\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "88. Multiply by 10 Without MUL",
    difficulty: "Medium",
    concepts: "Use shifts/additions: 10x=8x+2x.",
    description: "Multiply the byte at 5200H by 10 and store the 16-bit result at 5300H\u20135301H.",
    instructions: "Input: 12H.\nDesired Output / Final State\nOutput: 0078H.\nTest Cases\n12\u00d710\u21920078\n20\u00d710\u21920140\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "89. BCD Addition",
    difficulty: "Medium",
    concepts: "DAA converts the binary sum in A into valid packed BCD.",
    description: "Add packed BCD values at 5200H and 5201H using appropriate 8085 BCD adjustment. Store result and decimal carry.",
    instructions: "Input: 45H and 38H.\nDesired Output / Final State\nOutput: 83H, carry 00H.\nTest Cases\n45+38\u219283,0\n75+50\u219225,1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "90. Binary to Packed BCD",
    difficulty: "Medium",
    concepts: "Divide by ten to obtain decimal digits, then combine tens and units into nibbles.",
    description: "Convert a binary value 00\u201399 at 5200H into packed BCD at 5300H.",
    instructions: "Input: 63H (99 decimal).\nDesired Output / Final State\nOutput: 99H.\nTest Cases\n99\u219299H\n42\u219242H\n07\u219207H\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "91. 16-bit Array Sum",
    difficulty: "Hard",
    concepts: "Each element consumes two bytes; low/high carries must propagate.",
    description: "Sum N little-endian 16-bit values beginning at 5200H. Store the low 16-bit result at 5300H\u20135301H and overflow count at 5302H.",
    instructions: "Input: 1000H,2000H,3000H.\nDesired Output / Final State\nOutput: 6000H, overflow 00H.\nTest Cases\n1000+2000+3000\u21926000\nFFFF+0001\u21920000,overflow 1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "92. 16-bit Multiplication by Shift-and-Add",
    difficulty: "Hard",
    concepts: "Each multiplier bit conditionally adds a shifted multiplicand to a 16-bit accumulator.",
    description: "Multiply two unsigned 8-bit values using binary shift-and-add, producing a 16-bit product.",
    instructions: "Input: 13H\u00d70AH.\nDesired Output / Final State\nOutput: 00BEH.\nTest Cases\n13\u00d70A\u219200BE\nFF\u00d7FF\u2192FE01\n00\u00d755\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "93. Factorial up to 5",
    difficulty: "Hard",
    concepts: "Repeated multiplication must be built from repeated addition or shift/add because 8085 has no MUL.",
    description: "Calculate N! for N\u22645 and store the 16-bit result.",
    instructions: "Input: N=05H.\nDesired Output / Final State\nOutput: 0078H.\nTest Cases\n0\u21920001\n1\u21920001\n5\u21920078\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "94. Prime Test",
    difficulty: "Hard",
    concepts: "Test divisibility using repeated subtraction because 8085 lacks division.",
    description: "Determine whether the byte at 5200H is prime; store 01H if prime, else 00H. Treat 0 and 1 as non-prime.",
    instructions: "Input: 17H.\nDesired Output / Final State\nOutput: 01H.\nTest Cases\n17\u21921\n18\u21920\n1\u21920\n2\u21921\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "95. Generate First N Primes",
    difficulty: "Hard",
    concepts: "Combines candidate generation, prime testing, loops and memory output.",
    description: "Generate the first N prime numbers beginning at 5300H.",
    instructions: "Input: N=05H.\nDesired Output / Final State\nOutput: 02,03,05,07,0B.\nTest Cases\n5\u21922,3,5,7,11\n1\u21922\n0\u2192none\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "96. Sort Array Ascending",
    difficulty: "Hard",
    concepts: "Bubble sort uses CMP and swaps adjacent elements when out of order.",
    description: "Sort N unsigned bytes in place in ascending order.",
    instructions: "Input: 32,10,45,01,20.\nDesired Output / Final State\nOutput: 01,10,20,32,45.\nTest Cases\n32,10,45,01,20\u219201,10,20,32,45\nalready sorted\u2192same\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "97. Sort Array Descending",
    difficulty: "Hard",
    concepts: "Reverse the bubble-sort comparison condition.",
    description: "Sort N unsigned bytes in place in descending order.",
    instructions: "Input: 12,7F,34,01,55.\nDesired Output / Final State\nOutput: 7F,55,34,12,01.\nTest Cases\n12,7F,34,01,55\u21927F,55,34,12,01\nequal values\u2192same\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "98. Palindrome Array Check",
    difficulty: "Hard",
    concepts: "Compare symmetric elements from both ends and move toward the center.",
    description: "Determine whether an N-byte array reads identically forward and backward.",
    instructions: "Input: 11,22,33,22,11.\nDesired Output / Final State\nOutput: 01H.\nTest Cases\npalindrome\u21921\n11,22,33\u21920\none element\u21921\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "99. Longest Run of Equal Bytes",
    difficulty: "Hard",
    concepts: "Maintain current run length and maximum run while scanning adjacent elements.",
    description: "Find the maximum number of consecutive identical values in an array.",
    instructions: "Input: 10,10,20,20,20,30.\nDesired Output / Final State\nOutput: 03H.\nTest Cases\nabove\u21923\nall equal\u2192N\nall different\u21921\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "100. Multi-Precision 32-bit Addition",
    difficulty: "Hard",
    concepts: "An 8-bit processor must propagate carry through four bytes using ADC.",
    description: "Add two 32-bit little-endian numbers at 5200H and 5204H and store the result at 5300H\u20135303H.",
    instructions: "Input: 12345678H + 01020304H.\nDesired Output / Final State\nOutput: 1336597CH.\nTest Cases\n12345678+01020304\u21921336597C\nFFFFFFFF+1\u219200000000,final carry 1\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "101. Multi-Precision 32-bit Subtraction",
    difficulty: "Hard",
    concepts: "Use SUB for the least-significant byte and SBB for higher bytes.",
    description: "Subtract two 32-bit little-endian values using borrow propagation and store the 32-bit result.",
    instructions: "Input: 12345678H\u221201020304H.\nDesired Output / Final State\nOutput: 11325374H.\nTest Cases\n12345678\u221201020304\u219211325374\n10000000\u22121\u21920FFFFFFF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "102. Stack-Based Array Reverse",
    difficulty: "Hard",
    concepts: "Tests stack pointer setup, PUSH/POP, and stack direction.",
    description: "Reverse an array by pushing its elements onto the 8085 stack and popping them back.",
    instructions: "Input: 11,22,33,44.\nDesired Output / Final State\nOutput: 44,33,22,11.\nTest Cases\n4 bytes\u2192reverse\n1 byte\u2192same\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "103. Register-Preserving Subroutine",
    difficulty: "Hard",
    concepts: "CALL/RET define the subroutine; PUSH/POP preserve registers modified internally.",
    description: "Create a subroutine that increments HL while preserving BC and DE.",
    instructions: "Input: HL=12FFH, BC=1234H, DE=ABCDH.\nDesired Output / Final State\nOutput: HL=1300H; BC/DE unchanged.\nTest Cases\n12FF\u21921300\nFFFF\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "104. Operation Dispatcher",
    difficulty: "Hard",
    concepts: "Combines comparison, branching and multiple instruction paths.",
    description: "Read opcode 00=ADD, 01=SUB, 02=AND, 03=OR; operands at 5201H\u20135202H; store result at 5300H, invalid opcode\u2192FFH.",
    instructions: "Input: opcode=02, operands=F0,0F.\nDesired Output / Final State\nOutput: 00H.\nTest Cases\n00,10,20\u219230\n01,20,05\u21921B\n02,F0,0F\u219200\n03,50,0F\u21925F\ninvalid\u2192FF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "105. Checksum of Data Block",
    difficulty: "Hard",
    concepts: "The low byte of an accumulated sum naturally represents modulo-256 addition.",
    description: "Calculate the modulo-256 additive checksum of N bytes and store it at 5300H.",
    instructions: "Input: 10,20,30,40.\nDesired Output / Final State\nOutput: A0H.\nTest Cases\n10+20+30+40\u2192A0\nFF+01\u219200\nN=0\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "106. One's-Complement Checksum",
    difficulty: "Hard",
    concepts: "CMA produces the one's complement of the final 8-bit sum.",
    description: "Calculate the modulo-256 sum of N bytes, complement it, and store the checksum.",
    instructions: "Input: 12H,34H.\nDesired Output / Final State\nOutput: B9H.\nTest Cases\n12+34=46\u2192B9\nFF\u219200\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "107. Second Largest Distinct Value",
    difficulty: "Hard",
    concepts: "Maintain largest and second-largest values while ignoring duplicates of the largest.",
    description: "Find the second-largest distinct unsigned byte in an array.",
    instructions: "Input: 20,50,50,10,40,30.\nDesired Output / Final State\nOutput: 40H.\nTest Cases\nabove\u219240\n05,04,03,03,02\u219204\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "108. Remove Duplicates In Place",
    difficulty: "Hard",
    concepts: "For each value, search the already accepted prefix before appending it.",
    description: "Compact the first occurrences of values in an array and store the new length.",
    instructions: "Input: 10,20,10,30,20,40.\nDesired Output / Final State\nOutput: length 04; data 10,20,30,40.\nTest Cases\nabove\u21924,10,20,30,40\n01,01,01\u21921\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "109. Stable Move Zeros to End",
    difficulty: "Hard",
    concepts: "This is a stable partition problem requiring controlled copying and/or shifting.",
    description: "Move all zero bytes to the end while preserving the relative order of nonzero elements.",
    instructions: "Input: 00,12,00,34,56,00.\nDesired Output / Final State\nOutput: 12,34,56,00,00,00.\nTest Cases\nabove\u219212,34,56,00,00,00\nno zeros\u2192same\nall zeros\u2192same\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "110. 16-bit Memory Increment",
    difficulty: "Hard",
    concepts: "Increment low byte and propagate carry to the high byte.",
    description: "Increment a 16-bit little-endian number stored at 5200H\u20135201H in place.",
    instructions: "Input: 12FFH.\nDesired Output / Final State\nOutput: 1300H.\nTest Cases\n12FF\u21921300\nFFFF\u21920000\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "111. 16-bit Memory Decrement",
    difficulty: "Hard",
    concepts: "If the low byte is zero, set it to FFH and decrement the high byte.",
    description: "Decrement a 16-bit little-endian number stored at 5200H\u20135201H.",
    instructions: "Input: 1300H.\nDesired Output / Final State\nOutput: 12FFH.\nTest Cases\n1300\u219212FF\n0000\u2192FFFF\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "112. GCD of Two 8-bit Numbers",
    difficulty: "Hard",
    concepts: "Euclid repeatedly replaces (a,b) with (b,a mod b).",
    description: "Compute the GCD of two positive bytes using Euclid's algorithm and repeated subtraction for remainder.",
    instructions: "Input: 48H,18H.\nDesired Output / Final State\nOutput: 18H.\nTest Cases\n48,18\u219218\n21,0F\u219203\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "113. LCM Using GCD",
    difficulty: "Hard",
    concepts: "Use LCM=(a\u00d7b)/GCD(a,b), implementing multiplication/division in software.",
    description: "Calculate LCM(a,b) for two positive 8-bit values and store a 16-bit result.",
    instructions: "Input: 12H and 08H.\nDesired Output / Final State\nOutput: 0048H.\nTest Cases\n18,8\u219272\n6,4\u219212\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "114. Binary Search",
    difficulty: "Hard",
    concepts: "Binary search repeatedly halves the search interval; midpoint calculation must be implemented manually.",
    description: "Search a sorted array for a target and store 01H if found, 00H otherwise.",
    instructions: "Input: 10,20,30,40,50,60,70; target=40.\nDesired Output / Final State\nOutput: 01H.\nTest Cases\ntarget present\u21921\n41\u21920\nfirst\u21921\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
  {
    title: "115. Second-Level Flag Analysis",
    difficulty: "Hard",
    concepts: "DAA adjusts packed BCD after addition and changes flags; this makes processor flags observable outputs.",
    description: "Execute MVI A,7FH; ADI 01H; DAA and store A plus S,Z,AC,P,CY as separate bytes.",
    instructions: "Input: exact instruction sequence.\nDesired Output / Final State\nOutput: A=81H plus flag bytes matching the 8085 specification.\nTest Cases\nexact sequence must match 8085 flags\nEvaluation Notes\nThe platform should initialize the stated state, execute the submitted 8085 program, and compare the required final state. Intermediate register usage is unrestricted unless preservation is explicitly required.\n\nTest Cases:\nNone provided.",
    starterCode: "HLT\n",
    sampleSolution: "HLT\n",
    topic: "General"
  },
];
