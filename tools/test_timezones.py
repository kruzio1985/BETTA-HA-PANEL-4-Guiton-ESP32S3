"""Run with python tools/test_timezones.py."""
import json
import sys
import unittest
sys.dont_write_bytecode = True
from generate_timezones import DB, generate


class TimezoneDatabaseTests(unittest.TestCase):
    def test_generated_table_is_current(self):
        self.assertEqual((DB / 'zones.inc').read_text(encoding='utf-8'), generate())

    def test_representative_rules(self):
        zones = json.loads((DB / 'zones.json').read_text(encoding='utf-8'))
        self.assertEqual(zones['Africa/Ceuta'], 'CET-1CEST,M3.5.0,M10.5.0/3')
        self.assertEqual(zones['Asia/Shanghai'], 'CST-8')
        self.assertEqual(zones['Asia/Kathmandu'], '<+0545>-5:45')
        self.assertEqual(zones['America/New_York'], 'EST5EDT,M3.2.0,M11.1.0')
        self.assertIn('M10.', zones['Australia/Sydney'])
        self.assertNotIn('Africa/Unknown', zones)
        self.assertGreater(len(zones), 400)


if __name__ == '__main__':
    unittest.main()
