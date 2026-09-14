-- ==============================================================================
-- Pexpacks Supplies - Core School Stationery Catalog Seed
-- Migration 00128: Seed ~50 essential South African school stationery items
-- Ensures high-fidelity matching for the AI School List Converter
-- ==============================================================================

BEGIN;

INSERT INTO public.master_products (
  sku,
  name,
  description,
  category,
  brand,
  unit,
  packaging,
  specification,
  icon,
  visibility,
  availability,
  current_selling_price,
  calculated_selling_price,
  latest_verified_cost,
  pricing_status,
  active,
  requires_pexcover,
  pexco_code
) VALUES
  -- 1. Exercise Books & Notebooks
  ('PEX-EX-A4-72FM', 'A4 Exercise Book 72 Page Feint & Margin', 'Standard school exercise book with feint ruling and margin', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 72pg Feint & Margin', 'book', 'public', 'available', 12.50, 12.50, 6.20, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-72QM', 'A4 Exercise Book 72 Page Quad & Margin', 'Quad and margin ruled book for mathematics', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 72pg Quad & Margin', 'book', 'public', 'available', 13.00, 13.00, 6.50, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-72IM', 'A4 Exercise Book 72 Page Irish & Margin', 'Irish ruling with margin for foundation phase handwriting', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 72pg Irish & Margin', 'book', 'public', 'available', 13.00, 13.00, 6.50, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-72UN', 'A4 Exercise Book 72 Page Unruled', 'Blank unruled pages for drawing, biology and projects', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 72pg Unruled', 'book', 'public', 'available', 12.50, 12.50, 6.20, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-96HC', 'A4 Hardcover Book 96 Page Feint & Margin', 'Durable hardback counter book for high school subjects', 'Hardcover Books', 'Freedom', 'each', 'single', 'A4 96pg Hardcover 1-Quire', 'book', 'public', 'available', 26.50, 26.50, 14.00, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-192HC', 'A4 Hardcover Book 192 Page Feint & Margin', '2-Quire heavy duty hardback book for full-year subjects', 'Hardcover Books', 'Freedom', 'each', 'single', 'A4 192pg Hardcover 2-Quire', 'book', 'public', 'available', 38.50, 38.50, 21.00, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-288HC', 'A4 Hardcover Book 288 Page Feint & Margin', '3-Quire heavy duty hardback counter book', 'Hardcover Books', 'Freedom', 'each', 'single', 'A4 288pg Hardcover 3-Quire', 'book', 'public', 'available', 54.00, 54.00, 30.00, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A5-72FM', 'A5 Exercise Book 72 Page Feint & Margin', 'Compact A5 exercise book for homework or vocabulary', 'Exercise Books', 'Freedom', 'each', 'single', 'A5 72pg Feint & Margin', 'book', 'public', 'available', 9.50, 9.50, 4.80, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-NS', 'A4 Nature Study Book 72 Page', 'Alternating feint ruled and blank pages for natural sciences', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 72pg Interleaved Nature Study', 'book', 'public', 'available', 18.00, 18.00, 9.50, 'approved', true, true, 'PEXCO01'),
  ('PEX-EX-A4-MUS', 'A4 Music Manuscript Book 32 Page', 'Staff staves for music notation study', 'Exercise Books', 'Freedom', 'each', 'single', 'A4 32pg Music Staff', 'book', 'public', 'available', 22.00, 22.00, 11.00, 'approved', true, true, 'PEXCO01'),

  -- 2. Adhesives & Glues
  ('PEX-GL-PRITT-43', 'Pritt Glue Stick 43g Jumbo', 'Non-toxic, solvent-free stationery glue stick', 'Adhesives', 'Pritt', 'each', 'single', '43g large adhesive stick', 'stick', 'public', 'available', 52.50, 52.50, 32.00, 'approved', true, false, null),
  ('PEX-GL-PRITT-22', 'Pritt Glue Stick 22g Medium', 'Non-toxic glue stick for pencil cases', 'Adhesives', 'Pritt', 'each', 'single', '22g medium adhesive stick', 'stick', 'public', 'available', 36.00, 36.00, 21.00, 'approved', true, false, null),
  ('PEX-GL-BOST-CLR', 'Bostik Clear Adhesive 25ml', 'All-purpose fast-drying clear craft glue', 'Adhesives', 'Bostik', 'each', 'tube', '25ml clear contact adhesive', 'glue', 'public', 'available', 28.00, 28.00, 16.50, 'approved', true, false, null),
  ('PEX-GL-WOOD-100', 'Bostik Wood Glue 100ml', 'White PVA adhesive for paper, cardboard and crafts', 'Adhesives', 'Bostik', 'each', 'bottle', '100ml white PVA', 'glue', 'public', 'available', 29.50, 29.50, 17.00, 'approved', true, false, null),
  ('PEX-GL-BLUTACK', 'Bostik Blu Tack Reusable Adhesive 100g', 'Clean reusable adhesive tack for posters and mounting', 'Adhesives', 'Bostik', 'each', 'pack', '100g wallet', 'tack', 'public', 'available', 34.00, 34.00, 20.00, 'approved', true, false, null),

  -- 3. Writing Instruments & Pencils
  ('PEX-PN-BIC-BLU', 'Bic Cristal Medium Ballpoint Pen Blue', 'Classic hexagonal barrel reliable daily writing pen', 'Pens', 'Bic', 'each', 'single', '1.0mm medium nib blue ink', 'pen', 'public', 'available', 6.50, 6.50, 3.20, 'approved', true, false, null),
  ('PEX-PN-BIC-BLK', 'Bic Cristal Medium Ballpoint Pen Black', 'Classic hexagonal barrel black ink pen', 'Pens', 'Bic', 'each', 'single', '1.0mm medium nib black ink', 'pen', 'public', 'available', 6.50, 6.50, 3.20, 'approved', true, false, null),
  ('PEX-PN-BIC-RED', 'Bic Cristal Medium Ballpoint Pen Red', 'Red ballpoint pen for corrections and headings', 'Pens', 'Bic', 'each', 'single', '1.0mm medium nib red ink', 'pen', 'public', 'available', 6.50, 6.50, 3.20, 'approved', true, false, null),
  ('PEX-PN-BIC-4PK', 'Bic Cristal Ballpoint Pens 4 Pack (Black, Blue, Red, Green)', 'Convenient 4-colour everyday pen set', 'Pens', 'Bic', 'pack', 'wallet of 4', 'Assorted colours', 'pen', 'public', 'available', 26.00, 26.00, 14.00, 'approved', true, false, null),
  ('PEX-PC-STAD-HB', 'Staedtler Tradition HB Graphite Pencil', 'High break-resistant lead school pencil', 'Pencils', 'Staedtler', 'each', 'single', 'Grade HB graphite', 'pencil', 'public', 'available', 9.50, 9.50, 5.00, 'approved', true, false, null),
  ('PEX-PC-STAD-HB12', 'Staedtler Tradition HB Pencils Box of 12', 'Full term box of 12 HB graphite pencils', 'Pencils', 'Staedtler', 'box', 'box of 12', '12x Grade HB graphite pencils', 'pencil', 'public', 'available', 105.00, 105.00, 62.00, 'approved', true, false, null),
  ('PEX-PC-STAD-2B', 'Staedtler Noris 2B Pencil', 'Soft graphite pencil for art and shading', 'Pencils', 'Staedtler', 'each', 'single', 'Grade 2B graphite', 'pencil', 'public', 'available', 10.50, 10.50, 5.50, 'approved', true, false, null),
  ('PEX-MK-HL-4PK', 'Stabilo Boss Highlighters 4 Pack Assorted', 'Fluorescent chisel tip highlighters (Yellow, Green, Pink, Orange)', 'Highlighters', 'Stabilo', 'pack', 'wallet of 4', 'Water-based fluorescent ink', 'highlighter', 'public', 'available', 89.00, 89.00, 54.00, 'approved', true, false, null),
  ('PEX-MK-WB-BLK', 'Pentel Maxiflo Whiteboard Marker Bullet Tip Black', 'Pump-action liquid ink dry-wipe marker', 'Markers', 'Pentel', 'each', 'single', 'Bullet tip black dry-erase', 'marker', 'public', 'available', 32.00, 32.00, 18.00, 'approved', true, false, null),
  ('PEX-MK-PM-BLK', 'Sharpie Fine Point Permanent Marker Black', 'Quick-drying fade-resistant permanent marker for labelling', 'Markers', 'Sharpie', 'each', 'single', 'Fine tip waterproof black', 'marker', 'public', 'available', 24.50, 24.50, 14.00, 'approved', true, false, null),

  -- 4. Colouring & Art Supplies
  ('PEX-CP-FC-12', 'Faber-Castell Classic Colour Pencils 12 Pack', 'Rich pigment break-resistant wood-cased pencils', 'Colouring', 'Faber-Castell', 'pack', 'pack of 12', '12 full-length assorted colours', 'palette', 'public', 'available', 59.00, 59.00, 34.00, 'approved', true, false, null),
  ('PEX-CP-FC-24', 'Faber-Castell Classic Colour Pencils 24 Pack', 'Comprehensive set of 24 artists colour pencils', 'Colouring', 'Faber-Castell', 'pack', 'pack of 24', '24 full-length assorted colours', 'palette', 'public', 'available', 115.00, 115.00, 68.00, 'approved', true, false, null),
  ('PEX-CR-MON-12', 'Mon-Ami Retractable Wax Crayons 12 Pack', 'Twist-up non-mess plastic barrel crayons', 'Colouring', 'Mon-Ami', 'pack', 'pack of 12', '12 twistable vibrant colours', 'palette', 'public', 'available', 58.00, 58.00, 33.00, 'approved', true, false, null),
  ('PEX-CR-PNT-16', 'Pentel Arts Oil Pastels 16 Pack', 'Creamy blendable brilliant colour oil pastels', 'Colouring', 'Pentel', 'pack', 'pack of 16', '16 oil pastel sticks', 'palette', 'public', 'available', 48.00, 48.00, 27.00, 'approved', true, false, null),
  ('PEX-FL-STAD-10', 'Staedtler Triplus Fineliners 0.3mm 10 Pack', 'Ergonomic triangular barrel superfine pens', 'Fineliners', 'Staedtler', 'pack', 'wallet of 10', '0.3mm metal-clad tip assorted', 'pen', 'public', 'available', 165.00, 165.00, 98.00, 'approved', true, false, null),

  -- 5. Mathematics, Geometry & Calculators
  ('PEX-MT-OXFORD', 'Helix Oxford Mathematical Geometry Set 9-Piece', 'Traditional metal tin complete geometry instrument set', 'Mathematics', 'Oxford', 'set', 'tin set', 'Compass, dividers, set squares, protractor, ruler, stencil, eraser, sharpener', 'compass', 'public', 'available', 69.50, 69.50, 40.00, 'approved', true, false, null),
  ('PEX-CALC-SHARP', 'Sharp Scientific Calculator EL-W535SA WriteView', 'Approved scientific calculator for Grades 8 to 12 CAPS curriculum', 'Calculators', 'Sharp', 'each', 'blister pack', '422 functions 4-line WriteView display', 'calculator', 'public', 'available', 299.00, 299.00, 195.00, 'approved', true, false, null),
  ('PEX-CALC-CASIO', 'Casio FX-82ZA Plus II Scientific Calculator', 'CAPS approved scientific calculator for South African high schools', 'Calculators', 'Casio', 'each', 'blister pack', '252 functions natural textbook display', 'calculator', 'public', 'available', 319.00, 319.00, 210.00, 'approved', true, false, null),
  ('PEX-RL-MAR-30', 'Marlin 30cm Clear Shatterproof Ruler', 'Graduated millimetres and centimetres shatter-resistant acrylic', 'Measurement', 'Marlin', 'each', 'single', '30cm clear ruler', 'ruler', 'public', 'available', 7.50, 7.50, 3.50, 'approved', true, false, null),
  ('PEX-SC-MAP-BLUNT', 'Maped Sensoft 13cm Safety Scissors Blunt Tip', 'Flexible finger loops, stainless steel safety blades for primary school', 'Cutting', 'Maped', 'each', 'single', '13cm blunt safety tip', 'scissors', 'public', 'available', 29.50, 29.50, 16.00, 'approved', true, false, null),
  ('PEX-SC-MAP-SHARP', 'Maped Advanced 16cm Student Scissors Pointed Tip', 'Precision stainless steel blades for high school projects', 'Cutting', 'Maped', 'each', 'single', '16cm pointed blade', 'scissors', 'public', 'available', 38.00, 38.00, 21.00, 'approved', true, false, null),

  -- 6. Erasers, Sharpeners & Pencil Cases
  ('PEX-ER-STAD-RAS', 'Staedtler Rasoplast Combi Eraser', 'High quality latex-free pencil eraser', 'Erasers', 'Staedtler', 'each', 'single', 'Phthalate and latex free white eraser', 'eraser', 'public', 'available', 14.50, 14.50, 7.80, 'approved', true, false, null),
  ('PEX-ER-MAP-SOFT', 'Maped Softy Eraser', 'Soft vinyl eraser minimal crumb residue', 'Erasers', 'Maped', 'each', 'single', 'Small soft vinyl eraser', 'eraser', 'public', 'available', 9.00, 9.00, 4.50, 'approved', true, false, null),
  ('PEX-SH-DBL-MET', 'Maped Metal Double Hole Pencil Sharpener', 'Precision milled magnesium double canister sharpener', 'Sharpeners', 'Maped', 'each', 'single', 'Double hole standard & jumbo', 'sharpener', 'public', 'available', 18.50, 18.50, 9.80, 'approved', true, false, null),
  ('PEX-PC-PVC-33', 'Clear PVC Exam Pencil Case 33cm Large', 'Transparent regulation-compliant pencil case for school exams', 'Pencil Cases', 'Pexpacks', 'each', 'single', '33cm x 13cm clear zippered pouch', 'case', 'public', 'available', 28.00, 28.00, 14.00, 'approved', true, false, null),
  ('PEX-PC-DENIM', 'Barrel Fabric Pencil Case 22cm Double Zip', 'Durable canvas pencil case with 2 compartments', 'Pencil Cases', 'Pexpacks', 'each', 'single', '22cm dual compartment fabric', 'case', 'public', 'available', 65.00, 65.00, 36.00, 'approved', true, false, null),

  -- 7. Filing, Paper & Book Protection
  ('PEX-PP-TYP-A4', 'Typek A4 White Copy Paper 80gsm Ream (500 Sheets)', 'High whiteness premium multipurpose printing paper', 'Paper', 'Typek', 'ream', 'ream of 500', 'A4 80gsm bright white', 'file', 'public', 'available', 95.00, 95.00, 65.00, 'approved', true, false, null),
  ('PEX-FL-DISP-20', 'Butterfly A4 Display Book Flip File 20 Pockets', 'Protective plastic sleeve portfolio for assignments and certificates', 'Filing', 'Butterfly', 'each', 'single', '20 clear copy-safe pockets', 'folder', 'public', 'available', 29.50, 29.50, 15.00, 'approved', true, false, null),
  ('PEX-FL-DISP-30', 'Butterfly A4 Display Book Flip File 30 Pockets', '30 pocket presentation flip folder', 'Filing', 'Butterfly', 'each', 'single', '30 clear copy-safe pockets', 'folder', 'public', 'available', 38.00, 38.00, 20.00, 'approved', true, false, null),
  ('PEX-FL-DISP-50', 'Butterfly A4 Display Book Flip File 50 Pockets', '50 pocket heavy duty portfolio folder', 'Filing', 'Butterfly', 'each', 'single', '50 clear copy-safe pockets', 'folder', 'public', 'available', 58.00, 58.00, 32.00, 'approved', true, false, null),
  ('PEX-FL-LEV-ARCH', 'Bantex A4 Polypropylene Lever Arch File 70mm', 'Sturdy 70mm ring mechanism document arch binder', 'Filing', 'Bantex', 'each', 'single', '70mm spine A4 ring binder', 'archive', 'public', 'available', 68.00, 68.00, 39.00, 'approved', true, false, null),
  ('PEX-BK-COVER-10', 'Pexcover Heavy Duty Adjustable Book Covers Pack of 10', 'Pre-cut slip-on thick plastic protective covers for A4 exercise books', 'Book Covering', 'Pexcover', 'pack', 'pack of 10', '10x Heavy duty adjustable A4 sleeves', 'book', 'public', 'available', 45.00, 45.00, 22.00, 'approved', true, false, null),
  ('PEX-BK-ROLL-2M', 'Pexcover Self-Adhesive Heavy Duty Clear Book Film Roll 2m x 45cm', 'Non-yellowing clear sticky plastic covering for text books', 'Book Covering', 'Pexcover', 'roll', 'single roll', '2m x 45cm adhesive vinyl film', 'book', 'public', 'available', 32.00, 32.00, 16.00, 'approved', true, false, null)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  brand = EXCLUDED.brand,
  specification = EXCLUDED.specification,
  current_selling_price = EXCLUDED.current_selling_price,
  calculated_selling_price = EXCLUDED.calculated_selling_price,
  latest_verified_cost = EXCLUDED.latest_verified_cost,
  pricing_status = EXCLUDED.pricing_status,
  active = EXCLUDED.active,
  requires_pexcover = EXCLUDED.requires_pexcover,
  pexco_code = EXCLUDED.pexco_code,
  updated_at = now();

COMMIT;
