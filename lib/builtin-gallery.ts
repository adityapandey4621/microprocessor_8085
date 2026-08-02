export interface GalleryItem {
  id: string
  title: string
  description?: string
  code: string
  authorName: string
  updatedAt: string
  cached?: boolean
}

export const BUILTIN_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'fibonacci-8085',
    title: '1. Fibonacci Sequence Generator (10 numbers)',
    description: 'Generates the first 10 Fibonacci numbers and stores them in memory starting at address 2000H.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Fibonacci Sequence Generator
MVI C, 0AH      ; Count = 10 numbers
LXI H, 2000H    ; Memory pointer = 2000H
MVI D, 00H      ; First number = 0
MVI E, 01H      ; Second number = 1
MOV M, D        ; Store first number
INX H
DCR C
MOV M, E        ; Store second number
INX H
DCR C

LOOP: MOV A, D  ; A = D
ADD E           ; A = D + E
MOV M, A        ; Store sum
MOV D, E        ; D = E
MOV E, A        ; E = sum
INX H           ; Increment pointer
DCR C           ; Decrement count
JNZ LOOP        ; Loop until C = 0
HLT`,
    cached: true,
  },
  {
    id: 'bubble-sort-8085',
    title: '2. Bubble Sort in Memory (5 numbers)',
    description: 'Sorts an array of 5 unsigned 8-bit integers stored at 3000H in ascending order.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Bubble Sort Ascending at 3000H
START: MVI B, 04H      ; Outer loop counter = 4
LXI H, 3000H           ; Point to array start
INNER: MOV A, M        ; Load current element
INX H                  ; Point to next element
CMP M                  ; Compare current with next
JC SKIP                ; If A < next, no swap
JZ SKIP                ; If A == next, no swap
MOV D, M               ; Swap elements
MOV M, A
DCX H
MOV M, D
INX H
SKIP: DCR B            ; Decrement inner loop
JNZ INNER
HLT`,
    cached: true,
  },
  {
    id: 'bcd-binary-8085',
    title: '3. BCD to Binary Converter',
    description: 'Converts a 2-digit Packed BCD number in register A into its binary equivalent.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; BCD to Binary Conversion
MVI A, 45H      ; BCD number 45
MOV B, A        ; Save original BCD
ANI 0FH         ; Mask upper nibble -> Lower digit in A
MOV C, A        ; Save lower digit in C
MOV A, B        ; Restore original BCD
ANI F0H         ; Mask lower nibble
RRC
RRC
RRC
RRC             ; Upper digit now in lower bits
MOV D, A        ; Save upper digit
ADD A           ; A = 2x
ADD A           ; A = 4x
ADD D           ; A = 5x
ADD A           ; A = 10 * upper digit
ADD C           ; Add lower digit -> Result in A
HLT`,
    cached: true,
  },
  {
    id: 'traffic-light-8085',
    title: '4. Traffic Light Controller using 8255 PPI',
    description: 'Simulates a 3-state traffic light timer sequence across Output Ports 00H-02H.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Traffic Light Controller Sequence
GREEN: MVI A, 01H   ; Green LED ON
OUT 00H
MVI B, 05H
CALL DELAY

YELLOW: MVI A, 02H  ; Yellow LED ON
OUT 00H
MVI B, 02H
CALL DELAY

RED: MVI A, 04H     ; Red LED ON
OUT 00H
MVI B, 05H
CALL DELAY
JMP GREEN

DELAY: DCR B
JNZ DELAY
RET`,
    cached: true,
  },
  {
    id: 'multiplication-8085',
    title: '5. 8-Bit Multiplication by Repeated Addition (D * E -> HL)',
    description: 'Multiplies two unsigned 8-bit integers in D and E, storing the 16-bit product in HL.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; 8-bit Multiplication (D * E)
MVI D, 0BH      ; Multiplicand = 11
MVI E, 06H      ; Multiplier = 6
LXI H, 0000H    ; Clear product HL
MOV A, E        ; Check if multiplier is 0
ORA A
JZ DONE
MVI B, 00H      ; Clear high byte B
MOV C, D        ; C = Multiplicand
MULT: DAD B     ; HL = HL + Multiplicand
DCR E
JNZ MULT
DONE: HLT`,
    cached: true,
  },
  {
    id: 'division-8085',
    title: '6. 8-Bit Division and Remainder (D / E -> Q in B, R in A)',
    description: 'Divides D by E using repeated subtraction. Resulting Quotient is in B and Remainder in A.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; 8-bit Division (D / E)
MVI D, 2EH      ; Dividend = 46
MVI E, 07H      ; Divisor = 7
MVI B, 00H      ; Quotient counter = 0
MOV A, D        ; Load dividend into A
DIV_LOOP: CMP E ; Compare remainder with divisor
JC END_DIV      ; If A < E, division complete
SUB E           ; Subtract divisor
INR B           ; Increment quotient
JMP DIV_LOOP
END_DIV: HLT    ; A has remainder, B has quotient`,
    cached: true,
  },
  {
    id: 'hex-ascii-8085',
    title: '7. Hexadecimal Nibble to ASCII Character',
    description: 'Converts a single hex nibble (0-F) in register A into its ASCII character code.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Hex Nibble to ASCII Converter
MVI A, 0CH      ; Hex value 0CH ('C')
ANI 0FH         ; Mask lower nibble
CPI 0AH         ; Compare with 10
JC NUMERIC      ; If < 10, add '0' (30H)
ADI 07H         ; For A-F, adjust by 7
NUMERIC: ADI 30H; Add 30H -> ASCII code in A
HLT`,
    cached: true,
  },
  {
    id: 'palindrome-8085',
    title: '8. Palindrome Byte Array Checker',
    description: 'Checks if a 4-byte sequence at 4000H is a palindrome. Sets register D=01H if true, 00H if false.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Palindrome Byte Checker (4 bytes at 4000H)
LXI H, 4000H    ; Left pointer
LXI D, 4003H    ; Right pointer
MVI B, 02H      ; Compare 2 pairs
CHK_PAIR: LDAX D; Load right byte into A
CMP M           ; Compare with left byte
JNZ NOT_PAL     ; Mismatch -> not palindrome
INX H
DCX D
DCR B
JNZ CHK_PAIR
MVI D, 01H      ; D = 01H (True)
HLT
NOT_PAL: MVI D, 00H ; D = 00H (False)
HLT`,
    cached: true,
  },
  {
    id: 'max-element-8085',
    title: '9. Maximum Element Finder in Array (5 Bytes)',
    description: 'Finds the largest integer in a 5-byte array starting at 2100H and stores it at 2105H.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Maximum Element in Array at 2100H
LXI H, 2100H    ; Array start pointer
MVI C, 05H      ; Array length = 5
MOV A, M        ; Assume first element is max
INX H
DCR C
MAX_LOOP: CMP M ; Compare max with current
JNC NO_UPDATE   ; If A >= M, continue
MOV A, M        ; Else new max = M
NO_UPDATE: INX H
DCR C
JNZ MAX_LOOP
STA 2105H       ; Store maximum at 2105H
HLT`,
    cached: true,
  },
  {
    id: 'min-element-8085',
    title: '10. Minimum Element Finder in Array (5 Bytes)',
    description: 'Finds the smallest integer in a 5-byte array starting at 2100H and stores it at 2105H.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Minimum Element in Array at 2100H
LXI H, 2100H    ; Array start pointer
MVI C, 05H      ; Array length = 5
MOV A, M        ; Assume first element is min
INX H
DCR C
MIN_LOOP: CMP M ; Compare min with current
JC NO_UPDATE    ; If A < M, continue
JZ NO_UPDATE
MOV A, M        ; Else new min = M
NO_UPDATE: INX H
DCR C
JNZ MIN_LOOP
STA 2105H       ; Store minimum at 2105H
HLT`,
    cached: true,
  },
  {
    id: 'block-transfer-8085',
    title: '11. Block Data Transfer (10 Bytes from 2000H to 3000H)',
    description: 'Copies 10 consecutive memory bytes from source address 2000H to destination address 3000H.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Block Transfer 2000H -> 3000H
LXI H, 2000H    ; Source address
LXI D, 3000H    ; Destination address
MVI C, 0AH      ; Count = 10 bytes
COPY_LOOP: MOV A, M
STAX D
INX H
INX D
DCR C
JNZ COPY_LOOP
HLT`,
    cached: true,
  },
  {
    id: '16bit-addition-8085',
    title: '12. 16-Bit Addition of Register Pairs (HL = HL + DE)',
    description: 'Adds a 16-bit integer in DE to a 16-bit integer in HL using the DAD instruction.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; 16-Bit Addition using DAD
LXI H, 1234H    ; HL = 1234H
LXI D, 5678H    ; DE = 5678H
DAD D           ; HL = HL + DE -> 68ACH
HLT`,
    cached: true,
  },
  {
    id: 'count-set-bits-8085',
    title: '13. Count Number of Set Bits (1s) in Accumulator',
    description: 'Rotates register A through carry 8 times to count how many bits are set to 1, storing count in B.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Count Set Bits in Accumulator
MVI A, 5DH      ; Value 5DH = 01011101B (5 bits set)
MVI B, 00H      ; Bit counter = 0
MVI C, 08H      ; Loop 8 bits
BIT_LOOP: RRC   ; Rotate lowest bit into Carry
JNC NO_BIT
INR B           ; Increment counter if carry = 1
NO_BIT: DCR C
JNZ BIT_LOOP
HLT             ; Register B has set bit count (05H)`,
    cached: true,
  },
  {
    id: 'binary-to-gray-8085',
    title: '14. Binary to Gray Code Converter',
    description: 'Converts an 8-bit binary number in register A into its Gray Code equivalent using XOR.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Binary to Gray Code (Gray = Binary XOR (Binary >> 1))
MVI A, 3BH      ; Binary value 3BH
MOV B, A        ; Copy binary to B
RRC             ; Shift right 1 bit
ANI 7FH         ; Clear sign bit after rotate
XRA B           ; XOR with original binary -> Gray code in A
HLT`,
    cached: true,
  },
  {
    id: 'prime-checker-8085',
    title: '15. Prime Number Checker for Byte in E',
    description: 'Checks if integer in E is prime. Sets register D=01H if prime, 00H if composite.',
    authorName: 'SYS-BUILTIN',
    updatedAt: '2026-08-02',
    code: `; Prime Number Checker (Value in E)
MVI E, 0DH      ; Check if 13 is prime
MVI D, 00H      ; Default D = 0 (not prime/composite)
MOV A, E
CPI 02H
JC END_PRIME    ; Numbers < 2 are not prime
JZ IS_PRIME     ; 2 is prime
MVI B, 02H      ; Start divisor B = 2
CHK_DIV: MOV A, E
DIV_LOOP: SUB B ; Subtract divisor B
JZ NOT_PRIME    ; Remainder = 0 -> Divisible -> Not Prime
JNC DIV_LOOP    ; Keep subtracting while A >= B
INR B           ; Next divisor
MOV A, B
CMP E           ; If B == E, no divisors found -> Prime
JZ IS_PRIME
JMP CHK_DIV

IS_PRIME: MVI D, 01H ; D = 01H (Prime)
END_PRIME: HLT
NOT_PRIME: MVI D, 00H ; D = 00H (Not Prime)
HLT`,
    cached: true,
  },
]
