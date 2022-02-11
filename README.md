## **Ciphering CLI Tool**

Command utility for encoding / decoding ciphers:

- Caesar
- Atbash
- ROT-8/ROT-13

### **Command syntax**

```zsh
$ node cli-ciphernig -c <configuration> [-i <input file path>] [-o <input file path:>]
```

_where:_

- "-с or --config" - names and sequence of execution of ciphers, `example, "C1-C1-R0-A"`
  - Caesar -> `C1`-encryption and `С0`-decryption with Caesar cipher
  - Atbash -> `A` encryption / decryption with Atbash cipher
  - ROT-8/ROT-13 -> `R1`-encryption and `R0`-decryption with ROT cipher
- "-i or --input" - input data file path
- "-o or --output" - output data file path

If the "-i or -o" options are not specified, then the input and output streams are considered `stdin` and` stdout`, respectively.

### **Examples of running the cli command**

```zsh
$ node cli-ciphernig -c "C1-C1-R0-A" -i "./input.txt" -o "./output.txt"
# C1-C1-R0-A: encodes with Caesar cipher => encodes with Caesar cipher => decodes with ROT cipher => Atbash transformation
# read from file, write to file

$ node cli-ciphernig --config "C1-C1-R0-A" --output "./output.txt"
# ... transformation ...
# read from stream `stdin`, write to file

$ node cli-ciphernig -с "C1-C1-R0-A"
# ... transformation ...
# read from the `stdin` stream, write to the `stdout` stream
```
