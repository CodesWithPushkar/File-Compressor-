#include "huffman.h"


int isLeaf(MinHeapNode* root) {
    return !(root->left) && !(root->right);
}


MinHeap* createAndBuildMinHeap(unsigned char data[], int freq[], int size) {
    MinHeap* minHeap = createMinHeap(size);
    for (int i = 0; i < size; ++i)
        minHeap->array[i] = newNode(data[i], freq[i]);
    minHeap->size = size;
    buildMinHeap(minHeap);
    return minHeap;
}


MinHeapNode* buildHuffmanTree(unsigned char data[], int freq[], int size) {
    MinHeapNode *left, *right, *top;
    MinHeap* minHeap = createAndBuildMinHeap(data, freq, size);

    while (minHeap->size != 1) {
        left = extractMin(minHeap);
        right = extractMin(minHeap);

        top = newNode('$', left->freq + right->freq);
        top->left = left;
        top->right = right;
        insertMinHeap(minHeap, top);
    }
    return extractMin(minHeap);
}


void generateCodes(MinHeapNode* root, int arr[], int top, HuffmanCode* codes[], int* codeIndex) {
    if (root->left) {
        arr[top] = 0;
        generateCodes(root->left, arr, top + 1, codes, codeIndex);
    }
    if (root->right) {
        arr[top] = 1;
        generateCodes(root->right, arr, top + 1, codes, codeIndex);
    }
    if (isLeaf(root)) {
        codes[*codeIndex] = (HuffmanCode*)malloc(sizeof(HuffmanCode));
        codes[*codeIndex]->data = root->data;
        codes[*codeIndex]->code = (char*)malloc(sizeof(char) * (top + 1));
        for (int i = 0; i < top; ++i) {
            codes[*codeIndex]->code[i] = arr[i] + '0';
        }
        codes[*codeIndex]->code[top] = '\0';
        (*codeIndex)++;
    }
}