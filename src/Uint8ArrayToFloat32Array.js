const Uint8ArrayToFloat32Array = function (u8a){
  var f32Buffer = new Float32Array(u8a.length);
  for (var i = 0; i < u8a.length; i++) {
    var value = u8a[i<<1] + (u8a[(i<<1)+1]<<8);
    if (value >= 0x8000) value |= ~0x7FFF;
    f32Buffer[i] = value / 0x8000;
  }
  return f32Buffer;
}

export default Uint8ArrayToFloat32Array;