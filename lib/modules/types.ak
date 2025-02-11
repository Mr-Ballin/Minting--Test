pub type MyRedeemer {
  key: ByteArray,
  value: Int,
}

pub type Cip68 {
  metadata: Pairs<ByteArray, Data>,
  version: Int,
  extra: Data,
}
