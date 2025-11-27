#include "huffman.h"


void writeCompressedData(const char* inputFile, const char* outputFile, HuffmanCode* codes[], int uniqueChars, int frequencies[]) {
    FILE *in = fopen(inputFile, "rb");
    FILE *out = fopen(outputFile, "wb");
    if (!in || !out) {
        fprintf(stderr, "Error opening files for writing.\n");
        return;
    }


    fwrite(&uniqueChars, sizeof(int), 1, out);


    for (int i = 0; i < 256; i++) {
        if (frequencies[i] > 0) {
            unsigned char char_to_write = (unsigned char)i;
            fwrite(&char_to_write, sizeof(unsigned char), 1, out);
            fwrite(&frequencies[i], sizeof(int), 1, out);
        }
    }

    int ch;
    unsigned char buffer = 0;
    int bit_count = 0;

    while ((ch = fgetc(in)) != EOF) {
        char* code = NULL;
        for (int i = 0; i < uniqueChars; i++) {
            if (codes[i]->data == (unsigned char)ch) {
                code = codes[i]->code;
                break;
            }
        }

        if (code) {
            for (int i = 0; i < strlen(code); i++) {
                buffer = buffer << 1;
                if (code[i] == '1') {
                    buffer = buffer | 1;
                }
                bit_count++;
                if (bit_count == 8) {
                    fwrite(&buffer, sizeof(unsigned char), 1, out);
                    buffer = 0;
                    bit_count = 0;
                }
            }
        }
    }


    if (bit_count > 0) {
        buffer = buffer << (8 - bit_count);
        fwrite(&buffer, sizeof(unsigned char), 1, out);
    }

    fclose(in);
    fclose(out);
}



void decodeFile(MinHeapNode* root, FILE* in, FILE* out, long bitStart) {
    fseek(in, bitStart, SEEK_SET); 
    MinHeapNode* curr = root;
    unsigned char buffer;
    int bit_count = 0;
    long totalBits = 0; 
    long totalChars = 0;
    for(int i=0; i < root->freq; i++) {
        if(isLeaf(root)) {
            totalChars += root->freq;
        }
    }
   
    long charCount = root->freq;
    long charsWritten = 0;


    while (fread(&buffer, 1, 1, in) == 1 && charsWritten < charCount) {
        bit_count = 8;
        while (bit_count > 0 && charsWritten < charCount) {
            curr = (buffer & 0x80) ? curr->right : curr->left;
            buffer = buffer << 1;
            bit_count--;

            if (isLeaf(curr)) {
                fwrite(&curr->data, sizeof(unsigned char), 1, out);
                charsWritten++;
                curr = root;
            }
        }
    }
}