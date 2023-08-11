
pub mod challenge1 {
    use std::collections::Bitv;

    pub trait ToHex {
        fn to_hex(self) -> Option<Bitv>;
    }

    pub trait FromHex {
        fn from_hex(Bitv) -> Option<Self>;
    }

    macro_rules! add_bits (
        ($bits:ident, $a:expr $b:expr $c:expr $d:expr) => ({
            $bits.push($a == 1u8);
            $bits.push($b == 1u8);
            $bits.push($c == 1u8);
            $bits.push($d == 1u8);
        });
    )

    impl ToHex for String {
        fn to_hex(self) -> Option<Bitv> {
            let mut bits = Bitv::new();

            for byte in self.into_bytes().iter() {
                match *byte {
                    b'0' => add_bits!(bits, 0 0 0 0),
                    b'1' => add_bits!(bits, 0 0 0 1),
                    b'2' => add_bits!(bits, 0 0 1 0),
                    b'3' => add_bits!(bits, 0 0 1 1),
                    b'4' => add_bits!(bits, 0 1 0 0),
                    b'5' => add_bits!(bits, 0 1 0 1),
                    b'6' => add_bits!(bits, 0 1 1 0),
                    b'7' => add_bits!(bits, 0 1 1 1),
                    b'8' => add_bits!(bits, 1 0 0 0),
                    b'9' => add_bits!(bits, 1 0 0 1),
                    b'a' => add_bits!(bits, 1 0 1 0),
                    b'b' => add_bits!(bits, 1 0 1 1),
                    b'c' => add_bits!(bits, 1 1 0 0),
                    b'd' => add_bits!(bits, 1 1 0 1),
                    b'e' => add_bits!(bits, 1 1 1 0),
                    b'f' => add_bits!(bits, 1 1 1 1),
                    b'A' => add_bits!(bits, 1 0 1 0),
                    b'B' => add_bits!(bits, 1 0 1 1),
                    b'C' => add_bits!(bits, 1 1 0 0),
                    b'D' => add_bits!(bits, 1 1 0 1),
                    b'E' => add_bits!(bits, 1 1 1 0),
                    b'F' => add_bits!(bits, 1 1 1 1),
                    _    => return None,
                }
            }

            Some(bits)
        }
    }

    impl FromHex for String {
        fn from_hex(bits: Bitv) -> Option<String> {
            let mut i   = 0u8;
            let mut buf = Vec::new();
            let mut s   = String::new();

            for bit in bits.iter() {
                buf.push(bit);
                i += 1;

                if i == 4 {
                    match buf.as_slice() {
                        [false, false, false, false] =>  s.push_char('0'),
                        [false, false, false, true ] =>  s.push_char('1'),
                        [false, false, true,  false] =>  s.push_char('2'),
                        [false, false, true,  true ] =>  s.push_char('3'),
                        [false, true,  false, false] =>  s.push_char('4'),
                        [false, true,  false, true ] =>  s.push_char('5'),
                        [false, true,  true,  false] =>  s.push_char('6'),
                        [false, true,  true,  true ] =>  s.push_char('7'),
                        [true,  false, false, false] =>  s.push_char('8'),
                        [true,  false, false, true ] =>  s.push_char('9'),
                        [true,  false, true,  false] =>  s.push_char('A'),
                        [true,  false, true,  true ] =>  s.push_char('B'),
                        [true,  true,  false, false] =>  s.push_char('C'),
                        [true,  true,  false, true ] =>  s.push_char('D'),
                        [true,  true,  true,  false] =>  s.push_char('E'),
                        [true,  true,  true,  true ] =>  s.push_char('F'),
                        _ => return None,
                    }

                    i = 0;
                    buf = Vec::new();
                }
            }

            if i != 0 { None } else { Some(s) }
        }
    }

    #[test]
    fn to_hex_test() {
        fn eq(expected: Option<&[bool]>, hex: &str) {
            match (expected, String::from_str(hex).to_hex()) {
                (None,      None      ) => { },
                (Some(_),   None      ) => { fail!() },
                (None,      Some(_)   ) => { fail!() },
                (Some(arr), Some(bits)) => { assert!(bits.eq_vec(arr)) }
            }
        }

        eq(Some([false, false, false, false].as_slice()), "0");
        eq(Some([false, false, false, true ].as_slice()), "1");
        eq(Some([false, false, true,  false].as_slice()), "2");
        eq(Some([false, false, true,  true ].as_slice()), "3");
        eq(Some([false, true,  false, false].as_slice()), "4");
        eq(Some([false, true,  false, true ].as_slice()), "5");
        eq(Some([false, true,  true,  false].as_slice()), "6");
        eq(Some([false, true,  true,  true ].as_slice()), "7");
        eq(Some([true,  false, false, false].as_slice()), "8");
        eq(Some([true,  false, false, true ].as_slice()), "9");
        eq(Some([true,  false, true,  false].as_slice()), "a");
        eq(Some([true,  false, true,  true ].as_slice()), "b");
        eq(Some([true,  true,  false, false].as_slice()), "c");
        eq(Some([true,  true,  false, true ].as_slice()), "d");
        eq(Some([true,  true,  true,  false].as_slice()), "e");
        eq(Some([true,  true,  true,  true ].as_slice()), "f");
        eq(Some([true,  false, true,  false].as_slice()), "A");
        eq(Some([true,  false, true,  true ].as_slice()), "B");
        eq(Some([true,  true,  false, false].as_slice()), "C");
        eq(Some([true,  true,  false, true ].as_slice()), "D");
        eq(Some([true,  true,  true,  false].as_slice()), "E");
        eq(Some([true,  true,  true,  true ].as_slice()), "F");
        eq(Some([false, false, false, false, true, true, true, true].as_slice()), "0F");
    }
}
