#ifndef HUFFMAN_H
#define HUFFMAN_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_TREE_HT 256


typedef struct MinHeapNode {
    unsigned char data;
    unsigned freq;
    struct MinHeapNode *left, *right;
} MinHeapNode;

typedef struct MinHeap {
    unsigned size;
    unsigned capacity;
    MinHeapNode **array;
} MinHeap;

typedef struct HuffmanCode {
    unsigned char data;
    char* code;
} HuffmanCode;


MinHeapNode* newNode(unsigned char data, unsigned freq);
MinHeap* createMinHeap(unsigned capacity);
void swapMinHeapNode(MinHeapNode** a, MinHeapNode** b);
void minHeapify(MinHeap* minHeap, int idx);
MinHeapNode* extractMin(MinHeap* minHeap);
void insertMinHeap(MinHeap* minHeap, MinHeapNode* minHeapNode);
void buildMinHeap(MinHeap* minHeap);


int isLeaf(MinHeapNode* root);
MinHeap* createAndBuildMinHeap(unsigned char data[], int freq[], int size);
MinHeapNode* buildHuffmanTree(unsigned char data[], int freq[], int size);
void generateCodes(MinHeapNode* root, int arr[], int top, HuffmanCode* codes[], int* codeIndex);

void writeCompressedData(const char* inputFile, const char* outputFile, HuffmanCode* codes[], int uniqueChars, int frequencies[]);
void decodeFile(MinHeapNode* root, FILE* in, FILE* out, long bitStart);

#endif 