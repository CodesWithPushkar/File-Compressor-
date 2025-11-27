#include "huffman.h"

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input_file> <output_file>\n", argv[0]);
        return 1;
    }

    const char* inputFile = argv[1];
    const char* outputFile = argv[2];


    int frequencies[256] = {0};
    FILE* fp = fopen(inputFile, "rb");
    if (!fp) {
        fprintf(stderr, "Error: Could not open input file %s\n", inputFile);
        return 1;
    }
    int ch;
    while ((ch = fgetc(fp)) != EOF) {
        frequencies[(unsigned char)ch]++;
    }
    fclose(fp);

 
    int uniqueChars = 0;
    for (int i = 0; i < 256; i++) {
        if (frequencies[i] > 0) {
            uniqueChars++;
        }
    }

    if (uniqueChars == 0) {
    
        FILE* out = fopen(outputFile, "wb");
        if (out) {
            fwrite(&uniqueChars, sizeof(int), 1, out); 
            fclose(out);
        }
        printf("Input file is empty. Compressed file created.\n");
        return 0;
    }

    unsigned char* data = (unsigned char*)malloc(uniqueChars * sizeof(unsigned char));
    int* freq = (int*)malloc(uniqueChars * sizeof(int));
    int index = 0;
    for (int i = 0; i < 256; i++) {
        if (frequencies[i] > 0) {
            data[index] = (unsigned char)i;
            freq[index] = frequencies[i];
            index++;
        }
    }

  
    MinHeapNode* root = buildHuffmanTree(data, freq, uniqueChars);

 
    HuffmanCode** codes = (HuffmanCode**)malloc(uniqueChars * sizeof(HuffmanCode*));
    int arr[MAX_TREE_HT], top = 0, codeIndex = 0;
    generateCodes(root, arr, top, codes, &codeIndex);


    printf("Compressing file... Found %d unique characters.\n", uniqueChars);
    writeCompressedData(inputFile, outputFile, codes, uniqueChars, frequencies);
    printf("File successfully compressed to %s\n", outputFile);


    free(data);
    free(freq);
    for (int i = 0; i < uniqueChars; i++) {
        free(codes[i]->code);
        free(codes[i]);
    }
    free(codes);
    return 0;
}