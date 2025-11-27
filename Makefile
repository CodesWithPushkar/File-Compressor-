
CC = gcc

CFLAGS = -Wall -O3 -g


SRC_DIR = src
INCLUDE_DIR = include
BIN_DIR = bin


HEAP_SRC = $(SRC_DIR)/minheap.c
TREE_SRC = $(SRC_DIR)/huffman_tree.c
FILE_OPS_SRC = $(SRC_DIR)/file_ops.c


COMMON_OBJS = $(HEAP_SRC:.c=.o) $(TREE_SRC:.c=.o) $(FILE_OPS_SRC:.c=.o)


COMPRESSOR = $(BIN_DIR)/my_compressor
DECOMPRESSOR = $(BIN_DIR)/my_decompressor


all: $(BIN_DIR) $(COMPRESSOR) $(DECOMPRESSOR)


$(BIN_DIR):
	mkdir -p $(BIN_DIR)


$(COMPRESSOR): $(SRC_DIR)/compressor.c $(COMMON_OBJS)
	$(CC) $(CFLAGS) -I$(INCLUDE_DIR) $^ -o $@


$(DECOMPRESSOR): $(SRC_DIR)/decompressor.c $(COMMON_OBJS)
	$(CC) $(CFLAGS) -I$(INCLUDE_DIR) $^ -o $@


%.o: %.c
	$(CC) $(CFLAGS) -I$(INCLUDE_DIR) -c $< -o $@


clean:
	rm -f $(SRC_DIR)/*.o $(COMPRESSOR) $(DECOMPRESSOR)