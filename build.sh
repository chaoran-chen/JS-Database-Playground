#!/bin/bash

./node_modules/google-closure-library/closure/bin/build/closurebuilder.py \
    --root=node_modules/google-closure-library/ \
    --root=src/ \
    --root=test/ \
    --namespace="jdp.main" \
    --output_mode=compiled \
    --compiler_jar=node_modules/google-closure-compiler/compiler.jar \
    --compiler_flags="--source_map_format=V3" \
    --compiler_flags="--create_source_map=dist/js-db-playground.js.map" \
    --compiler_flags="--js_output_file=dist/js-db-playground.js" \
    --compiler_flags="--compilation_level=SIMPLE_OPTIMIZATIONS"

echo "//# sourceMappingURL=js-db-playground.js.map" >> dist/js-db-playground.js
