#include "huffman.h"

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <compressed_file> <output_file>\n", argv[0]);
        return 1;
    }
    const char* compressedFile = argv[1];
    const char* outputFile = argv[2];
    
    FILE* in = fopen(compressedFile, "rb");
    if (!in) {
        fprintf(stderr, "Could not open %s for reading.\n", compressedFile);
        return 1;
    }
    
    int uniqueChars;
    fread(&uniqueChars, sizeof(int), 1, in);

    if (uniqueChars == 0) {
     
        FILE* out = fopen(outputFile, "wb");
        if (out) {
            fclose(out);
        }
        printf("File was empty. Decompression completed.\n");
        fclose(in);
        return 0;
    }

    unsigned char* data = (unsigned char*)malloc(uniqueChars * sizeof(unsigned char));
    int* freq = (int*)malloc(uniqueChars * sizeof(int));
    
    for (int i = 0; i < uniqueChars; i++) {
        unsigned char ch;
        int frequency;
        fread(&ch, sizeof(unsigned char), 1, in);
        fread(&frequency, sizeof(int), 1, in);
        data[i] = ch;
        freq[i] = frequency;
    }
    
    long bitStart = ftell(in); 
    MinHeapNode* root = buildHuffmanTree(data, freq, uniqueChars);
    
    FILE* out = fopen(outputFile, "wb");
    if (!out) {
        fprintf(stderr, "Could not open %s for writing.\n", outputFile);
        fclose(in);
        free(data);
        free(freq);
        return 1;
    }
    
    decodeFile(root, in, out, bitStart);
    
    fclose(in);
    fclose(out);
    free(data);
    free(freq);

    
    printf("Decompression completed. Output written to %s\n", outputFile);
    return 0;
}