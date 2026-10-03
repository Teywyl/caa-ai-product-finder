-- CAA AI Product Finder catalogue seed.
-- Based on the vehicle and listing information gathered for the revision.
--
-- Running this resets catalogue data.
-- Existing users and sessions are preserved.
-- Prices and stock remain unconfirmed until checked.
-- Create the first admin separately with npm run user:create.

BEGIN;

TRUNCATE
  compatibility,
  product_links,
  products,
  vehicle_models,
  brands
RESTART IDENTITY CASCADE;

INSERT INTO brands (id, name, logo_url) VALUES
  ('nissan', 'Nissan', NULL),
  ('suzuki', 'Suzuki', NULL),
  ('honda', 'Honda', NULL);

INSERT INTO vehicle_models (
  id,
  brand_id,
  name,
  variant,
  body_type,
  year_from,
  year_to,
  aliases,
  reference_label,
  reference_year,
  sketchfab_url,
  model_file,
  model_title,
  model_author,
  model_author_url,
  model_license,
  model_license_url
) VALUES
  (
    'nissan-terra',
    'nissan',
    'Terra',
    NULL,
    'suv',
    2018,
    2026,
    ARRAY['terra']::TEXT[],
    'Nissan Terra 2020',
    2020,
    'https://sketchfab.com/3d-models/nissan-terra-2020-46727bb6f4f84df5878bed50c58a70bf',
    'models/nissan-terra-2020.glb',
    'Nissan Terra 2020',
    'Asadawut.Kaewma',
    'https://sketchfab.com/Asadawut.Kaewma',
    'CC BY 4.0',
    'http://creativecommons.org/licenses/by/4.0/'
  ),
  (
    'nissan-navara-calibre-e',
    'nissan',
    'Navara',
    'Calibre E',
    'pickup',
    2014,
    2026,
    ARRAY['navara', 'np300', 'calibre', 'calibre e']::TEXT[],
    'Nissan Navara Calibre E 2021',
    2021,
    'https://sketchfab.com/3d-models/nissan-navara-2021-calibre-e-2a877fdf866b4dbb8b0aa4dd9ef2319d',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'nissan-almera-versa',
    'nissan',
    'Almera / Versa',
    '1.6',
    'sedan',
    2013,
    2026,
    ARRAY['almera', 'versa']::TEXT[],
    'Nissan Versa sedan 1.6, 2015',
    2015,
    'https://sketchfab.com/3d-models/2015-nissan-versa-sedan-16-18af87c9490e4acb80a46b70ca8d86ed',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'suzuki-ertiga',
    'suzuki',
    'Ertiga',
    NULL,
    'mpv',
    2012,
    2026,
    ARRAY['ertiga']::TEXT[],
    'Suzuki Ertiga 2022',
    2022,
    'https://sketchfab.com/3d-models/2022-suzuki-ertiga-4f14afac3ac44ec4a2fb153e18452f8b',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'suzuki-s-presso',
    'suzuki',
    'S-Presso',
    NULL,
    'mini',
    2019,
    2026,
    ARRAY['s-presso', 'spresso', 's presso']::TEXT[],
    'Suzuki S-Presso',
    NULL,
    'https://sketchfab.com/3d-models/suzuki-s-presso-eee53feaf00741f0a5e5535cad0dcae4',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'suzuki-jimny',
    'suzuki',
    'Jimny',
    NULL,
    'offroad',
    2018,
    2026,
    ARRAY['jimny']::TEXT[],
    'Suzuki Jimny',
    NULL,
    'https://sketchfab.com/3d-models/suzuki-jimny-942987d14be64808ad8dce51ad527c7c',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'honda-city',
    'honda',
    'City',
    NULL,
    'sedan',
    2014,
    2026,
    ARRAY['city']::TEXT[],
    'Honda City 2022',
    2022,
    'https://sketchfab.com/3d-models/honda-city-2022-322b45e01411412f9951ac4766550653',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'honda-civic-type-r',
    'honda',
    'Civic',
    'Type R',
    'hatch',
    2017,
    2026,
    ARRAY['civic', 'type r', 'typer', 'civic type r']::TEXT[],
    'Honda Civic Type R 2023',
    2023,
    'https://sketchfab.com/3d-models/honda-civic-type-r-2023-959eced6b43549638fec212245646f1c',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'honda-cr-v',
    'honda',
    'CR-V',
    NULL,
    'suv',
    2017,
    2026,
    ARRAY['cr-v', 'crv', 'cr v']::TEXT[],
    'Honda CR-V',
    NULL,
    'https://sketchfab.com/3d-models/honda-cr-v-4d0751311d76473b81377f5bd2da273b',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );

INSERT INTO products (
  id,
  name,
  category,
  part_number,
  description,
  listed,
  stock_status,
  stock_checked_on
) OVERRIDING SYSTEM VALUE VALUES
  (
    1,
    'Aircon Evaporator (Cooling Coil)',
    'Evaporator',
    NULL,
    'Car aircon evaporator (cooling coil). Shopee listing title: “Aircon Evaporator Nissan NP300 El (2016 upwards) and Nissan Terra (2018-) Cooling coil Car aircon”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    2,
    'Fuel Filter',
    'Fuel Filter',
    '16403-4KV0A',
    'Fuel filter. Shopee listing title: “Fuel Filter Nissan Terra 2018-Up Navara NP300 Calibre 2014-Up 16403-4KV0A”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    3,
    'Cabin Filter',
    'Cabin Filter',
    NULL,
    'Aircon cabin filter. Shopee listing title: “Cabin Filter for Nissan Terra (2018-current) and Nissan Navara NP300 EL Calibre (2014-2020)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    4,
    'Air Filter (Navara listing)',
    'Air Filter',
    NULL,
    'Air filter. Lazada listing supplied for the Navara Calibre E (found with the shop search “Navara Calibre E”). The listing title and year range are not recorded yet.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    5,
    'Evaporator Blower Motor Assembly',
    'Blower Motor',
    NULL,
    'Aircon blower motor assembly. Shopee listing title: “Nissan Navara 2010 Evaporator Blower Motor Assembly Aircon blower”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    6,
    'Aircon Evaporator (Navara listing)',
    'Evaporator',
    NULL,
    'Aircon evaporator. Lazada listing supplied for the Navara (found with the shop search “Navara”). The listing title and year range are not recorded yet.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    7,
    'Air Filter (Almera record)',
    'Air Filter',
    NULL,
    'Air filter recorded under the Almera / Versa. No listing title, year range, or marketplace links have been supplied yet.',
    TRUE,
    'unconfirmed',
    NULL
  );

SELECT setval(
  pg_get_serial_sequence('products', 'id'),
  (SELECT max(id) FROM products)
);

INSERT INTO product_links (product_id, marketplace, url) VALUES
  (
    1,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i4093525668-s22503554215.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ATerra%253Bnid%253A4093525668%253Bsrc%253AlazadaInShopSrp%253Brn%253A7ffedd6a8d54fb81b2042826a97e823c%253Bregion%253Aph%253Bsku%253A4093525668_PH%253Bprice%253A2499%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A4093525668%253Bsku_id%253A22503554215%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2499&priceCompare=skuId%3A22503554215%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A7ffedd6a8d54fb81b2042826a97e823c%3BoriginPrice%3A249900%3BdisplayPrice%3A249900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790832631137&ratingscore=5.0&request_id=7ffedd6a8d54fb81b2042826a97e823c&review=8&sale=33&search=1&spm=a2o4l.store_keyword.list.2&stock=1'
  ),
  (
    1,
    'shopee',
    'https://shopee.ph/Aircon-Evaporator-Nissan-NP300-El-(2016-upwards)-and-Nissan-Terra-(2018-)-Cooling-coil-Car-aircon-i.329965539.22453598578?extraParams=%7B%22display_model_id%22%3A128730291387%2C%22model_selection_logic%22%3A3%7D'
  ),
  (
    2,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2662539052-s12669762211.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ATerra%253Bnid%253A2662539052%253Bsrc%253AlazadaInShopSrp%253Brn%253A7ffedd6a8d54fb81b2042826a97e823c%253Bregion%253Aph%253Bsku%253A2662539052_PH%253Bprice%253A399%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A1%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23479%253Bitem_id%253A2662539052%253Bsku_id%253A12669762211%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=399&priceCompare=skuId%3A12669762211%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A7ffedd6a8d54fb81b2042826a97e823c%3BoriginPrice%3A39900%3BdisplayPrice%3A39900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790832631137&ratingscore=5.0&request_id=7ffedd6a8d54fb81b2042826a97e823c&review=34&sale=262&search=1&spm=a2o4l.store_keyword.list.1&stock=1'
  ),
  (
    2,
    'shopee',
    'https://shopee.ph/Fuel-Filter-Nissan-Terra-2018-Up-Navara-NP300-Calibre-2014-Up-16403-4KV0A-i.329965539.9597827051?extraParams=%7B%22display_model_id%22%3A114834151698%2C%22model_selection_logic%22%3A3%7D'
  ),
  (
    3,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2145757626-s9574632417.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ATerra%253Bnid%253A2145757626%253Bsrc%253AlazadaInShopSrp%253Brn%253A7ffedd6a8d54fb81b2042826a97e823c%253Bregion%253Aph%253Bsku%253A2145757626_PH%253Bprice%253A279%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2145757626%253Bsku_id%253A9574632417%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=279&priceCompare=skuId%3A9574632417%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A7ffedd6a8d54fb81b2042826a97e823c%3BoriginPrice%3A27900%3BdisplayPrice%3A27900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790832631137&ratingscore=4.831896551724138&request_id=7ffedd6a8d54fb81b2042826a97e823c&review=232&sale=1048&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    3,
    'shopee',
    'https://shopee.ph/Cabin-Filter-for-Nissan-Terra-(2018-current)-and-Nissan-Navara-NP300-EL-Calibre-(2014-2020)-i.329965539.8876819796?extraParams=%7B%22display_model_id%22%3A211508850040%2C%22model_selection_logic%22%3A3%7D'
  ),
  (
    4,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2145719846-s9574465713.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ANavara%252BCalibre%252BE%253Bnid%253A2145719846%253Bsrc%253AlazadaInShopSrp%253Brn%253Aaaf5711889ed995e8c2bf3596b133435%253Bregion%253Aph%253Bsku%253A2145719846_PH%253Bprice%253A399%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A3%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2145719846%253Bsku_id%253A9574465713%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=399&priceCompare=skuId%3A9574465713%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Aaaf5711889ed995e8c2bf3596b133435%3BoriginPrice%3A39900%3BdisplayPrice%3A39900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790838833794&ratingscore=4.880952380952381&request_id=aaf5711889ed995e8c2bf3596b133435&review=42&sale=271&search=1&spm=a2o4l.store_keyword.list.3&stock=0'
  ),
  (
    5,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2346776240-s10662112360.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ANavara%253Bnid%253A2346776240%253Bsrc%253AlazadaInShopSrp%253Brn%253Afa5d7e18948c205bd3b5e991be486b55%253Bregion%253Aph%253Bsku%253A2346776240_PH%253Bprice%253A1699%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A3%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A2346776240%253Bsku_id%253A10662112360%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=1699&priceCompare=skuId%3A10662112360%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Afa5d7e18948c205bd3b5e991be486b55%3BoriginPrice%3A169900%3BdisplayPrice%3A169900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790839166861&ratingscore=4.7272727272727275&request_id=fa5d7e18948c205bd3b5e991be486b55&review=22&sale=98&search=1&spm=a2o4l.store_keyword.list.3&stock=1'
  ),
  (
    5,
    'shopee',
    'https://shopee.ph/Nissan-Navara-2010-Evaporator-Blower-Motor-Assembly-Aircon-blower-i.329965539.20802512603?extraParams=%7B%22display_model_id%22%3A116622157209%2C%22model_selection_logic%22%3A3%7D'
  ),
  (
    6,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i226305737-s299789936.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ANavara%253Bnid%253A226305737%253Bsrc%253AlazadaInShopSrp%253Brn%253Afa5d7e18948c205bd3b5e991be486b55%253Bregion%253Aph%253Bsku%253A226305737_PH%253Bprice%253A2199%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A6%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A226305737%253Bsku_id%253A299789936%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2199&priceCompare=skuId%3A299789936%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Afa5d7e18948c205bd3b5e991be486b55%3BoriginPrice%3A219900%3BdisplayPrice%3A219900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790839166861&ratingscore=5.0&request_id=fa5d7e18948c205bd3b5e991be486b55&review=13&sale=51&search=1&spm=a2o4l.store_keyword.list.6&stock=0'
  );

INSERT INTO compatibility (
  product_id,
  model_id,
  year_from,
  year_to,
  status,
  source
) VALUES
  (
    1,
    'nissan-terra',
    2018,
    NULL,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra (2018-)”.'
  ),
  (
    2,
    'nissan-terra',
    2018,
    NULL,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra 2018-Up”.'
  ),
  (
    3,
    'nissan-terra',
    2018,
    NULL,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra (2018-current)”.'
  ),
  (
    2,
    'nissan-navara-calibre-e',
    2014,
    NULL,
    'confirmed',
    'Supplied under Navara. Listing title: “Navara NP300 Calibre 2014-Up”.'
  ),
  (
    3,
    'nissan-navara-calibre-e',
    2014,
    2020,
    'confirmed',
    'Listing title: “Nissan Navara NP300 EL Calibre (2014-2020)”.'
  ),
  (
    3,
    'nissan-navara-calibre-e',
    2021,
    NULL,
    'needs_verification',
    'Supplied under the Navara Calibre E 2021 reference vehicle, but the listing title states 2014–2020. Not shown for 2021 onward until fitment is confirmed.'
  ),
  (
    1,
    'nissan-navara-calibre-e',
    2016,
    NULL,
    'needs_verification',
    'Listing title also names “NP300 El (2016 upwards)”, but this listing was supplied for Terra only. Confirm Navara Calibre E fitment before enabling.'
  ),
  (
    4,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Navara Calibre E. No year range recorded.'
  ),
  (
    5,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Listing title mentions “Navara 2010”. That does not establish fitment for the Navara Calibre E (2021 reference vehicle).'
  ),
  (
    6,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Navara. Listing title and year range not recorded.'
  ),
  (
    7,
    'nissan-almera-versa',
    NULL,
    NULL,
    'needs_verification',
    'Listed under Almera with no listing details, links, or year range.'
  );

COMMIT;
