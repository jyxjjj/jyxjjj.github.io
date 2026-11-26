# build.sh

将以下代码块保存为 `build.sh`，与另一构建脚本放在同一目录。

```bash
#!/bin/bash
set -euo pipefail

SOURCE_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(pwd)
INSTALL_DIR="$ROOT/audio-prefix"
export INSTALL_DIR
export CFLAGS="-Oz -I$INSTALL_DIR/include"
export CXXFLAGS="$CFLAGS"
export LDFLAGS="-Oz -L$INSTALL_DIR/lib"
export EM_PKG_CONFIG_PATH="$INSTALL_DIR/lib/pkgconfig"

git clone --depth 1 --branch n5.1.4 https://github.com/FFmpeg/FFmpeg.git ffmpeg
git clone --depth 1 --branch v12.15 https://github.com/ffmpegwasm/ffmpeg.wasm.git ffmpeg-wasm
git clone https://github.com/ffmpegwasm/lame.git lame
git -C lame checkout 2badea1974ae36cb8312afe99cff1e6b3b5decee
curl -fLsS https://cdnjs.cloudflare.com/ajax/libs/ffmpeg-core/0.12.10/esm/ffmpeg-core.js -o original-core.mjs

cd "$ROOT/lame"
emconfigure ./configure --prefix="$INSTALL_DIR" --build=x86_64-pc-linux-gnu --host=i686-linux --disable-shared --disable-frontend --disable-analyzer-hooks --disable-dependency-tracking --disable-gtktest
emmake make -j8 install

cd "$ROOT/ffmpeg"
emconfigure ./configure \
  --target-os=none --arch=x86_32 --enable-cross-compile \
  --disable-asm --disable-stripping --disable-programs --disable-doc \
  --disable-debug --disable-runtime-cpudetect --disable-autodetect \
  --disable-everything --disable-network --disable-pthreads \
  --disable-w32threads --disable-os2threads --disable-avdevice \
  --disable-swscale --disable-postproc --enable-small --enable-libmp3lame \
  --enable-decoder=aac,alac,flac,pcm_s16le,pcm_s16be,pcm_s24le,pcm_s24be,pcm_s32le,pcm_s32be,pcm_f32le,pcm_f64le \
  --enable-encoder=aac,libmp3lame \
  --enable-demuxer=mov,matroska,mpegts,avi,flv,aac,flac,wav \
  --enable-muxer=mp3,adts,ipod --enable-parser=aac,aac_latm,flac \
  --enable-protocol=file --enable-filter=abuffer,abuffersink,anull,aresample,aformat \
  --nm=emnm --ar=emar --ranlib=emranlib --cc=emcc --cxx=em++ \
  --objcc=emcc --dep-cc=emcc \
  --extra-cflags="-Oz -I../audio-prefix/include" \
  --extra-ldflags="-Oz -L../audio-prefix/lib"
emmake make -j8
mkdir -p src dist
cp -R "$ROOT/ffmpeg-wasm/src/bind" src/
cp -R "$ROOT/ffmpeg-wasm/src/fftools" src/

node --input-type=module <<'JS'
import fs from 'node:fs';
const path = 'src/fftools/cmdutils.c';
const source = fs.readFileSync(path, 'utf8');
const original = '    EM_ASM({\n        Module.ret = $0;\n    }, ret);';
if (!source.includes(original)) throw Error('Unexpected exit binding');
// The pinned CDN loader uses this EM_ASM callback ID
const replacement = `    const char *volatile exit_callback = CODE_EXPR("{ Module.ret = $0; }");
    (void)exit_callback;
    (void)emscripten_asm_const_int((const char *)6077464, "i", ret);`;
fs.writeFileSync(path, source.replace(original, replacement));
JS

emcc -Oz -I. -Isrc/fftools -I"$INSTALL_DIR/include" -L"$INSTALL_DIR/lib" \
  src/fftools/cmdutils.c src/fftools/ffmpeg.c src/fftools/ffmpeg_filter.c \
  src/fftools/ffmpeg_hw.c src/fftools/ffmpeg_mux.c src/fftools/ffmpeg_opt.c \
  src/fftools/opt_common.c -Wno-deprecated-declarations \
  -Wl,--start-group libavcodec/libavcodec.a libavfilter/libavfilter.a \
  libavformat/libavformat.a libavutil/libavutil.a libswresample/libswresample.a \
  -lmp3lame -Wl,--end-group \
  -sWASM_BIGINT -sMODULARIZE -sINITIAL_MEMORY=32MB -sALLOW_MEMORY_GROWTH \
  -sEXPORT_NAME=createFFmpegCore -sEXPORTED_FUNCTIONS=_ffmpeg,_abort,_malloc \
  -sEXPORTED_RUNTIME_METHODS=FS,setValue,getValue,UTF8ToString,lengthBytesUTF8,stringToUTF8 \
  -lworkerfs.js --pre-js src/bind/ffmpeg/bind.js -sEXPORT_ES6 \
  -o dist/ffmpeg-core.mjs
cd "$ROOT"
node "$SOURCE_DIR/align-abi.mjs"
```
