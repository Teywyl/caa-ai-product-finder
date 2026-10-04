-- CAA AI Product Finder catalogue seed.
-- Based on the vehicle and listing information supplied for the revision.
--
-- Running this resets catalogue data.
-- Existing users and sessions are preserved.
-- Prices and stock remain unconfirmed until checked.
-- Year rules: “up”, “upwards”, “current”, “latest” or an open “2018-” end in 2026;
-- “below” / “down” start from 2000.
-- TikTok links were reported as unavailable for every product, so none are stored.
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
    -- Variant cleared: the supplied Almera parts are for 1.2L / 1.5L engines,
    -- so "1.6" (the Sketchfab reference car) would be misleading as a variant.
    'nissan-almera-versa',
    'nissan',
    'Almera / Versa',
    NULL,
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
    -- Year range widened to 2009 to cover the GM-generation evaporator and blower motor.
    'honda-city',
    'honda',
    'City',
    NULL,
    'sedan',
    2009,
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
    -- Replaces the earlier Civic Type R (2017+) entry with the Civic FD.
    'honda-civic-fd',
    'honda',
    'Civic',
    'FD',
    'sedan',
    2006,
    2011,
    ARRAY['civic', 'civic fd', 'fd', 'fd2', 'type r', 'civic type r']::TEXT[],
    'Honda Civic Type R FD2 2009 (custom)',
    2009,
    'https://sketchfab.com/3d-models/2009-honda-civic-type-r-fd2-custom-0669282e31c049478aea166e47a3ebd6',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    -- Year range widened to 2001 to cover the gen 2 evaporator and gen 3/4 cabin filters.
    'honda-cr-v',
    'honda',
    'CR-V',
    NULL,
    'suv',
    2001,
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
  -- Nissan: Terra / Navara
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
    'Air filter. Lazada-only listing supplied for the Navara Calibre E (found with the shop search “Navara Calibre E”). Listing title and year range not recorded.',
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
    'Aircon evaporator. Lazada-only listing supplied for the Navara (found with the shop search “Navara”). Listing title and year range not recorded.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Nissan: Almera
  (
    7,
    'Air Filter (Almera 1.5L)',
    'Air Filter',
    '16546-ED000',
    'Engine air filter. Shopee listing title: “Nissan Almera AIR Filter 1.5L (2014-2020) 16546-ED000”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    8,
    'Cabin Air Filter (Almera)',
    'Cabin Filter',
    '16546-AA030',
    'Aircon cabin filter. Shopee listing title: “Nissan Almera 1.2L 2013-2021 Cabin Air filter package 16546-aa030”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    9,
    'Aircon Evaporator (Almera, 2016 and below)',
    'Evaporator',
    NULL,
    'Car aircon evaporator (cooling coil). Shopee listing title: “Aircon Evaporator Nissan Almera (2016 below) Cooling coil Car aircon”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    10,
    'Aircon Evaporator (Almera, 2017–2026)',
    'Evaporator',
    NULL,
    'Aircon evaporator. Lazada-only listing supplied for the Almera 2017–2026. Listing title not recorded.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Suzuki: Ertiga
  (
    11,
    'Air Filter (Ertiga 2019-up)',
    'Air Filter',
    NULL,
    'Engine air filter. Shopee listing title: “Air Filter for Suzuki Ertiga All new (2019 up)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    12,
    'Aircon Cabin Filter (Ertiga 2019-up)',
    'Cabin Filter',
    NULL,
    'Aircon cabin filter. Shopee listing title: “Aircon Cabin Filter for Suzuki Ertiga All new (2019 up)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    13,
    'Laminated Evaporator Cooling Coil (Ciaz / Ertiga / Vitara)',
    'Evaporator',
    NULL,
    'Laminated aircon evaporator. Shopee listing title: “Suzuki Ciaz (2015-) Ertiga (2014-2018) Vitara (2016-) Evaporator Laminated Cooling Coil”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Suzuki: S-Presso
  (
    14,
    'Air Filter (S-Presso, non-AGS)',
    'Air Filter',
    NULL,
    'Engine air filter for non-AGS variants. Shopee listing title: “Air Filter (Engine) for Suzuki S-PRESSO (Spresso) (2020-2023) non ags”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    15,
    'Aircon Cabin Filter (S-Presso, non-AGS)',
    'Cabin Filter',
    NULL,
    'Aircon cabin filter for non-AGS variants. Shopee listing title: “Aircon Cabin Filter for Suzuki S-PRESSO (Spresso) (2020-2023) NON AGS”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Suzuki: Jimny
  (
    16,
    'Air Filter (Jimny 2019-up)',
    'Air Filter',
    NULL,
    'Engine air filter. Shopee listing title: “Suzuki Jimny 2019 up Air Filter”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    17,
    'Charcoal Cabin Filter (Jimny 2019-up)',
    'Cabin Filter',
    NULL,
    'Charcoal aircon cabin filter. Shopee listing title: “Suzuki Jimny 2019 up Charcoal Cabin Filter”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    18,
    'Aircon Evaporator (Jimny listing)',
    'Evaporator',
    NULL,
    'Aircon evaporator. Lazada-only listing supplied for the Jimny (found with the shop search “jimny”). Listing title and year range not recorded.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Honda: City
  (
    19,
    'Air Filter (City GN)',
    'Air Filter',
    NULL,
    'Engine air filter. Shopee listing title: “Air Filter for Honda City GN 2021-2023 Honda City GN Hatch and all new Honda City GN”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    20,
    'Charcoal Cabin Filter (Honda multi-fit)',
    'Cabin Filter',
    NULL,
    'Charcoal aircon cabin filter. Shopee listing title: “Charcoal Cabin filter for Honda City Jazz Mobilio Brio HRV BRV Civic FC (check YR in details)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    21,
    'Laminated Evaporator Coil (City GM2)',
    'Evaporator',
    NULL,
    'Laminated aircon evaporator coil. Shopee listing title: “Honda City GM2 Evaporator coil laminated 2009-2013 (Transformer)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    22,
    'Evaporator Blower Motor (City GM)',
    'Blower Motor',
    NULL,
    'Aircon blower motor. Shopee listing title: “City GM 09-14 Evaporator Blower Motor”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Honda: Civic FD
  (
    23,
    'Air Filter (Civic FD 2.0L)',
    'Air Filter',
    '17220-RRA-A00',
    'Engine air filter for the 2.0L engine. Shopee listing title: “AIR FILTER For HONDA Civic FD 2.0L 2006-2011 17220-RRA-A00”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    24,
    'Cabin Filter (Civic FD/FB, CR-V, Accord, Odyssey)',
    'Cabin Filter',
    NULL,
    'Aircon cabin filter. Shopee listing title: “Cabin Filter for Civic FD FB 2006-2015 CR-V 2007-2016 Accord 2003-2021 Odyssey 2005-2014”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  -- Honda: CR-V
  (
    25,
    'Cabin Aircon Filter (CR-V gen 3 and 4)',
    'Cabin Filter',
    NULL,
    'Aircon cabin filter. Shopee listing title: “CRV gen 3 and 4 cabin aircon filter (2007-2016)”.',
    TRUE,
    'unconfirmed',
    NULL
  ),
  (
    26,
    'Aircon Evaporator (CR-V gen 2)',
    'Evaporator',
    NULL,
    'Aircon evaporator. Shopee listing title: “Aircon Evaporator Honda CRV gen 2”.',
    TRUE,
    'unconfirmed',
    NULL
  );

SELECT setval(
  pg_get_serial_sequence('products', 'id'),
  (SELECT max(id) FROM products)
);

INSERT INTO product_links (product_id, marketplace, url) VALUES
  -- 1 Evaporator (Terra / NP300)
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
  -- 2 Fuel Filter
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
  -- 3 Cabin Filter (Terra / Navara)
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
  -- 4 Air Filter (Navara) — Lazada only
  (
    4,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2145719846-s9574465713.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ANavara%252BCalibre%252BE%253Bnid%253A2145719846%253Bsrc%253AlazadaInShopSrp%253Brn%253Aaaf5711889ed995e8c2bf3596b133435%253Bregion%253Aph%253Bsku%253A2145719846_PH%253Bprice%253A399%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A3%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2145719846%253Bsku_id%253A9574465713%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=399&priceCompare=skuId%3A9574465713%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Aaaf5711889ed995e8c2bf3596b133435%3BoriginPrice%3A39900%3BdisplayPrice%3A39900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790838833794&ratingscore=4.880952380952381&request_id=aaf5711889ed995e8c2bf3596b133435&review=42&sale=271&search=1&spm=a2o4l.store_keyword.list.3&stock=0'
  ),
  -- 5 Blower Motor (Navara)
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
  -- 6 Evaporator (Navara) — Lazada only
  (
    6,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i226305737-s299789936.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ANavara%253Bnid%253A226305737%253Bsrc%253AlazadaInShopSrp%253Brn%253Afa5d7e18948c205bd3b5e991be486b55%253Bregion%253Aph%253Bsku%253A226305737_PH%253Bprice%253A2199%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A6%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A226305737%253Bsku_id%253A299789936%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2199&priceCompare=skuId%3A299789936%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Afa5d7e18948c205bd3b5e991be486b55%3BoriginPrice%3A219900%3BdisplayPrice%3A219900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1790839166861&ratingscore=5.0&request_id=fa5d7e18948c205bd3b5e991be486b55&review=13&sale=51&search=1&spm=a2o4l.store_keyword.list.6&stock=0'
  ),
  -- 7 Air Filter (Almera 1.5L)
  (
    7,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2149038903-s9590330946.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aalmera%253Bnid%253A2149038903%253Bsrc%253AlazadaInShopSrp%253Brn%253A5800fcde82d712a4cdf1c72ee59328b2%253Bregion%253Aph%253Bsku%253A2149038903_PH%253Bprice%253A269%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2149038903%253Bsku_id%253A9590330946%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=269&priceCompare=skuId%3A9590330946%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A5800fcde82d712a4cdf1c72ee59328b2%3BoriginPrice%3A26900%3BdisplayPrice%3A26900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791098998291&ratingscore=4.9&request_id=5800fcde82d712a4cdf1c72ee59328b2&review=10&sale=36&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    7,
    'shopee',
    'https://shopee.ph/Nissan-Almera-AIR-Filter-1.5L-(2014-2020)-16546-ED000-i.329965539.11417777464?extraParams=%7B%22display_model_id%22%3A66384748398%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 8 Cabin Air Filter (Almera)
  (
    8,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2145781914-s16900271821.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aalmera%253Bnid%253A2145781914%253Bsrc%253AlazadaInShopSrp%253Brn%253A5800fcde82d712a4cdf1c72ee59328b2%253Bregion%253Aph%253Bsku%253A2145781914_PH%253Bprice%253A249%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A3%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2145781914%253Bsku_id%253A16900271821%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=249&priceCompare=skuId%3A16900271821%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A5800fcde82d712a4cdf1c72ee59328b2%3BoriginPrice%3A24900%3BdisplayPrice%3A24900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791098998291&ratingscore=5.0&request_id=5800fcde82d712a4cdf1c72ee59328b2&review=54&sale=408&search=1&spm=a2o4l.store_keyword.list.3&stock=1'
  ),
  (
    8,
    'shopee',
    'https://shopee.ph/Nissan-Almera-1.2L-2013-2021-Cabin-Air-filter-package-16546-aa030-i.329965539.25617952053?extraParams=%7B%22display_model_id%22%3A240443111305%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 9 Evaporator (Almera, 2016 and below)
  (
    9,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i3470949103-s17849924242.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aalmera%253Bnid%253A3470949103%253Bsrc%253AlazadaInShopSrp%253Brn%253A5800fcde82d712a4cdf1c72ee59328b2%253Bregion%253Aph%253Bsku%253A3470949103_PH%253Bprice%253A1950%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A4%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A3470949103%253Bsku_id%253A17849924242%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=1.95E%203&priceCompare=skuId%3A17849924242%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A5800fcde82d712a4cdf1c72ee59328b2%3BoriginPrice%3A195000%3BdisplayPrice%3A195000%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791098998291&ratingscore=5.0&request_id=5800fcde82d712a4cdf1c72ee59328b2&review=26&sale=108&search=1&spm=a2o4l.store_keyword.list.4&stock=1'
  ),
  (
    9,
    'shopee',
    'https://shopee.ph/Aircon-Evaporator-Nissan-Almera-(2016-below)-Cooling-coil-Car-aircon-i.329965539.23409039958?extraParams=%7B%22display_model_id%22%3A193433640152%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 10 Evaporator (Almera, 2017–2026) — Lazada only
  (
    10,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i4093526584-s22503133409.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aalmera%253Bnid%253A4093526584%253Bsrc%253AlazadaInShopSrp%253Brn%253A5800fcde82d712a4cdf1c72ee59328b2%253Bregion%253Aph%253Bsku%253A4093526584_PH%253Bprice%253A1950%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A7%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A4093526584%253Bsku_id%253A22503133409%253Bshop_id%253A106849%253BtemplateInfo%253A107881_C_E%2523-1_A3%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=1.95E%203&priceCompare=skuId%3A22503133409%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A5800fcde82d712a4cdf1c72ee59328b2%3BoriginPrice%3A195000%3BdisplayPrice%3A195000%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791098998291&ratingscore=5.0&request_id=5800fcde82d712a4cdf1c72ee59328b2&review=5&sale=18&search=1&spm=a2o4l.store_keyword.list.7&stock=0'
  ),
  -- 11 Air Filter (Ertiga 2019-up)
  (
    11,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2407620052-s10979112771.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253AErtiga%253Bnid%253A2407620052%253Bsrc%253AlazadaInShopSrp%253Brn%253A6f397f8f44ebee5b5d293d2d84019d6a%253Bregion%253Aph%253Bsku%253A2407620052_PH%253Bprice%253A269%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2407620052%253Bsku_id%253A10979112771%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=269&priceCompare=skuId%3A10979112771%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6f397f8f44ebee5b5d293d2d84019d6a%3BoriginPrice%3A26900%3BdisplayPrice%3A26900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791099659826&ratingscore=4.9411764705882355&request_id=6f397f8f44ebee5b5d293d2d84019d6a&review=34&sale=129&search=1&spm=a2o4l.store_keyword.list.2&stock=1'
  ),
  (
    11,
    'shopee',
    'https://shopee.ph/Air-Filter-for-Suzuki-Ertiga-All-new-(2019-up)-i.329965539.10457213059?extraParams=%7B%22display_model_id%22%3A112974319309%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 12 Cabin Filter (Ertiga 2019-up)
  (
    12,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2407581278-s10979116241.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253AErtiga%253Bnid%253A2407581278%253Bsrc%253AlazadaInShopSrp%253Brn%253A6f397f8f44ebee5b5d293d2d84019d6a%253Bregion%253Aph%253Bsku%253A2407581278_PH%253Bprice%253A239%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A3%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2407581278%253Bsku_id%253A10979116241%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=239&priceCompare=skuId%3A10979116241%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6f397f8f44ebee5b5d293d2d84019d6a%3BoriginPrice%3A23900%3BdisplayPrice%3A23900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791099659826&ratingscore=4.95&request_id=6f397f8f44ebee5b5d293d2d84019d6a&review=40&sale=157&search=1&spm=a2o4l.store_keyword.list.3&stock=1'
  ),
  (
    12,
    'shopee',
    'https://shopee.ph/Aircon-Cabin-Filter-for-Suzuki-Ertiga-All-new-(2019-up)-i.329965539.10457215795?extraParams=%7B%22display_model_id%22%3A102974339964%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 13 Evaporator (Ciaz / Ertiga / Vitara)
  (
    13,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i3757428385-s19889574791.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253AErtiga%253Bnid%253A3757428385%253Bsrc%253AlazadaInShopSrp%253Brn%253A6f397f8f44ebee5b5d293d2d84019d6a%253Bregion%253Aph%253Bsku%253A3757428385_PH%253Bprice%253A2399%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A6%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23473%253Bitem_id%253A3757428385%253Bsku_id%253A19889574791%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2399&priceCompare=skuId%3A19889574791%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6f397f8f44ebee5b5d293d2d84019d6a%3BoriginPrice%3A239900%3BdisplayPrice%3A239900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791099659826&ratingscore=&request_id=6f397f8f44ebee5b5d293d2d84019d6a&review=&sale=3&search=1&spm=a2o4l.store_keyword.list.6&stock=1'
  ),
  (
    13,
    'shopee',
    'https://shopee.ph/Suzuki-Ciaz-(2015-)-Ertiga-(2014-2018)-Vitara-(2016-)-Evaporator-Laminated-Cooling-Coil-i.329965539.57309892967?extraParams=%7B%22display_model_id%22%3A435873132278%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 14 Air Filter (S-Presso, non-AGS)
  (
    14,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2795015028-s13496546585.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aspresso%253Bnid%253A2795015028%253Bsrc%253AlazadaInShopSrp%253Brn%253Aec915b489cace2a607db22f5c539c8d5%253Bregion%253Aph%253Bsku%253A2795015028_PH%253Bprice%253A269%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2795015028%253Bsku_id%253A13496546585%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=269&priceCompare=skuId%3A13496546585%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Aec915b489cace2a607db22f5c539c8d5%3BoriginPrice%3A26900%3BdisplayPrice%3A26900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100100800&ratingscore=4.91&request_id=ec915b489cace2a607db22f5c539c8d5&review=100&sale=346&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    14,
    'shopee',
    'https://shopee.ph/Air-Filter-(Engine)-for-Suzuki-S-PRESSO-(Spresso)-(2020-2023)-non-ags-i.329965539.17019644118?extraParams=%7B%22display_model_id%22%3A142933181019%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 15 Cabin Filter (S-Presso, non-AGS)
  (
    15,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2407482591-s10978924727.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aspresso%253Bnid%253A2407482591%253Bsrc%253AlazadaInShopSrp%253Brn%253Aec915b489cace2a607db22f5c539c8d5%253Bregion%253Aph%253Bsku%253A2407482591_PH%253Bprice%253A229%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A2%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A2407482591%253Bsku_id%253A10978924727%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=229&priceCompare=skuId%3A10978924727%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Aec915b489cace2a607db22f5c539c8d5%3BoriginPrice%3A22900%3BdisplayPrice%3A22900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100100800&ratingscore=4.838842975206612&request_id=ec915b489cace2a607db22f5c539c8d5&review=242&sale=782&search=1&spm=a2o4l.store_keyword.list.2&stock=1'
  ),
  (
    15,
    'shopee',
    'https://shopee.ph/Aircon-Cabin-Filter-for-Suzuki-S-PRESSO-(Spresso)-(2020-2023)-NON-AGS-i.329965539.12524436697?extraParams=%7B%22display_model_id%22%3A121102623309%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 16 Air Filter (Jimny 2019-up)
  -- NOTE: this Lazada link was supplied for BOTH the Jimny air filter and the
  -- Jimny cabin filter. It is stored here only. Check which product it is.
  (
    16,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i15620784062-s133634036207.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Ajimny%253Bnid%253A15620784062%253Bsrc%253AlazadaInShopSrp%253Brn%253A4ff50e2a003dba2078629da4baf3caf9%253Bregion%253Aph%253Bsku%253A15620784062_PH%253Bprice%253A589%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23469%253Bitem_id%253A15620784062%253Bsku_id%253A133634036207%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=589&priceCompare=skuId%3A133634036207%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A4ff50e2a003dba2078629da4baf3caf9%3BoriginPrice%3A58900%3BdisplayPrice%3A58900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100505584&ratingscore=&request_id=4ff50e2a003dba2078629da4baf3caf9&review=&sale=0&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    16,
    'shopee',
    'https://shopee.ph/Suzuki-Jimny-2019-up-Air-Filter-i.329965539.54767953444?extraParams=%7B%22display_model_id%22%3A416519603383%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 17 Charcoal Cabin Filter (Jimny 2019-up) — Shopee only until its Lazada link is confirmed
  (
    17,
    'shopee',
    'https://shopee.ph/Suzuki-Jimny-2019-up-Charcoal-Cabin-Filter-i.329965539.48918036296?extraParams=%7B%22display_model_id%22%3A351524204369%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 18 Evaporator (Jimny) — Lazada only
  (
    18,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i4260864981-s23823388173.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Ajimny%253Bnid%253A4260864981%253Bsrc%253AlazadaInShopSrp%253Brn%253A4ff50e2a003dba2078629da4baf3caf9%253Bregion%253Aph%253Bsku%253A4260864981_PH%253Bprice%253A2500%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A1%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A4260864981%253Bsku_id%253A23823388173%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2.5E%203&priceCompare=skuId%3A23823388173%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A4ff50e2a003dba2078629da4baf3caf9%3BoriginPrice%3A250000%3BdisplayPrice%3A250000%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100505584&ratingscore=&request_id=4ff50e2a003dba2078629da4baf3caf9&review=&sale=3&search=1&spm=a2o4l.store_keyword.list.1&stock=0'
  ),
  -- 19 Air Filter (City GN)
  (
    19,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i3470745442-s17848921526.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACity%253Bnid%253A3470745442%253Bsrc%253AlazadaInShopSrp%253Brn%253A6724b5ac0fd5cd979320ab70abeb4218%253Bregion%253Aph%253Bsku%253A3470745442_PH%253Bprice%253A329%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A1%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A3470745442%253Bsku_id%253A17848921526%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=329&priceCompare=skuId%3A17848921526%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6724b5ac0fd5cd979320ab70abeb4218%3BoriginPrice%3A32900%3BdisplayPrice%3A32900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100847719&ratingscore=4.95&request_id=6724b5ac0fd5cd979320ab70abeb4218&review=20&sale=136&search=1&spm=a2o4l.store_keyword.list.1&stock=1'
  ),
  (
    19,
    'shopee',
    'https://shopee.ph/Air-Filter-for-Honda-City-GN-2021-2023-Honda-City-GN-Hatch-and-all-new-Honda-City-GN-i.329965539.19766706900?extraParams=%7B%22display_model_id%22%3A107801341347%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 20 Charcoal Cabin Filter (Honda multi-fit)
  (
    20,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i3470883027-s17849073568.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACity%253Bnid%253A3470883027%253Bsrc%253AlazadaInShopSrp%253Brn%253A6724b5ac0fd5cd979320ab70abeb4218%253Bregion%253Aph%253Bsku%253A3470883027_PH%253Bprice%253A529%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A3470883027%253Bsku_id%253A17849073568%253Bshop_id%253A106849%253BtemplateInfo%253A107881_A3_C_E%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=529&priceCompare=skuId%3A17849073568%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6724b5ac0fd5cd979320ab70abeb4218%3BoriginPrice%3A52900%3BdisplayPrice%3A52900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100847719&ratingscore=4.976744186046512&request_id=6724b5ac0fd5cd979320ab70abeb4218&review=43&sale=135&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    20,
    'shopee',
    'https://shopee.ph/Charcoal-Cabin-filter-for-Honda-City-Jazz-Mobilio-Brio-HRV-BRV-Civic-FC-(check-YR-in-details)-i.329965539.10117785321?extraParams=%7B%22display_model_id%22%3A36385251787%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 21 Evaporator (City GM2)
  (
    21,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2450833103-s11193587638.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACity%253Bnid%253A2450833103%253Bsrc%253AlazadaInShopSrp%253Brn%253A6724b5ac0fd5cd979320ab70abeb4218%253Bregion%253Aph%253Bsku%253A2450833103_PH%253Bprice%253A1950%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A4%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A2450833103%253Bsku_id%253A11193587638%253Bshop_id%253A106849%253BtemplateInfo%253A107881_A3_C_E%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=1.95E%203&priceCompare=skuId%3A11193587638%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6724b5ac0fd5cd979320ab70abeb4218%3BoriginPrice%3A195000%3BdisplayPrice%3A195000%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100847719&ratingscore=5.0&request_id=6724b5ac0fd5cd979320ab70abeb4218&review=9&sale=33&search=1&spm=a2o4l.store_keyword.list.4&stock=1'
  ),
  (
    21,
    'shopee',
    'https://shopee.ph/Honda-City-GM2-Evaporator-coil-laminated-2009-2013-(Transformer)-i.329965539.11763480295?extraParams=%7B%22display_model_id%22%3A77619892265%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 22 Blower Motor (City GM)
  (
    22,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i271007930-s133228844522.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACity%253Bnid%253A271007930%253Bsrc%253AlazadaInShopSrp%253Brn%253A6724b5ac0fd5cd979320ab70abeb4218%253Bregion%253Aph%253Bsku%253A271007930_PH%253Bprice%253A1599%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A8%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23470%253Bitem_id%253A271007930%253Bsku_id%253A133228844522%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=1599&priceCompare=skuId%3A133228844522%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A6724b5ac0fd5cd979320ab70abeb4218%3BoriginPrice%3A159900%3BdisplayPrice%3A159900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791100847719&ratingscore=4.869565217391305&request_id=6724b5ac0fd5cd979320ab70abeb4218&review=23&sale=70&search=1&spm=a2o4l.store_keyword.list.8&stock=1'
  ),
  (
    22,
    'shopee',
    'https://shopee.ph/City-GM-09-14-Evaporator-Blower-Motor-i.329965539.13192157152?extraParams=%7B%22display_model_id%22%3A135726720328%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 23 Air Filter (Civic FD 2.0L)
  (
    23,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2149208510-s9591087506.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACivic%253Bnid%253A2149208510%253Bsrc%253AlazadaInShopSrp%253Brn%253Afd610a7f44052ec54faa260a44f51884%253Bregion%253Aph%253Bsku%253A2149208510_PH%253Bprice%253A329%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A7%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2149208510%253Bsku_id%253A9591087506%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=329&priceCompare=skuId%3A9591087506%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Afd610a7f44052ec54faa260a44f51884%3BoriginPrice%3A32900%3BdisplayPrice%3A32900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791101409422&ratingscore=5.0&request_id=fd610a7f44052ec54faa260a44f51884&review=9&sale=34&search=1&spm=a2o4l.store_keyword.list.7&stock=1'
  ),
  (
    23,
    'shopee',
    'https://shopee.ph/AIR-FILTER-For-HONDA-Civic-FD-2.0L-2006-2011-17220-RRA-A00-i.329965539.6694324932?extraParams=%7B%22display_model_id%22%3A83396568722%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 24 Cabin Filter (Civic FD/FB, CR-V, Accord, Odyssey)
  -- The same Lazada item (pdp-i2662500285) was supplied under both Civic and CR-V.
  (
    24,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i2662500285-s133642964911.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACivic%253Bnid%253A2662500285%253Bsrc%253AlazadaInShopSrp%253Brn%253Afd610a7f44052ec54faa260a44f51884%253Bregion%253Aph%253Bsku%253A2662500285_PH%253Bprice%253A269%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A0%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23476%253Bitem_id%253A2662500285%253Bsku_id%253A133642964911%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=269&priceCompare=skuId%3A133642964911%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3Afd610a7f44052ec54faa260a44f51884%3BoriginPrice%3A26900%3BdisplayPrice%3A26900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791101409422&ratingscore=5.0&request_id=fd610a7f44052ec54faa260a44f51884&review=7&sale=42&search=1&spm=a2o4l.store_keyword.list.0&stock=1'
  ),
  (
    24,
    'shopee',
    'https://shopee.ph/Cabin-Filter-for-Civic-FD-FB-2006-2015-CR-V-2007-2016-Accord-2003-2021-Odyssey-2005-2014-i.329965539.4261688076?extraParams=%7B%22display_model_id%22%3A381273544757%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 25 Cabin Filter (CR-V gen 3 and 4) — Shopee only
  (
    25,
    'shopee',
    'https://shopee.ph/CRV-gen-3-and-4-cabin-aircon-filter-(2007-2016)-i.329965539.5261690767?extraParams=%7B%22display_model_id%22%3A41728917123%2C%22model_selection_logic%22%3A3%7D'
  ),
  -- 26 Evaporator (CR-V gen 2)
  (
    26,
    'lazada',
    'https://www.lazada.com.ph/products/pdp-i271007819-s393739028.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253ACRV%253Bnid%253A271007819%253Bsrc%253AlazadaInShopSrp%253Brn%253A64c196621a0ef00ccbfd82974bff2857%253Bregion%253Aph%253Bsku%253A271007819_PH%253Bprice%253A2049%253Bclient%253Adesktop%253Bsupplier_id%253A100090341%253Bsession_id%253A%253Bbiz_source%253Ahttps%253A%252F%252Fwww.lazada.com.ph%252F%253Bslot%253A7%253Butlog_bucket_id%253A470687%253Basc_category_id%253A23467%253Bitem_id%253A271007819%253Bsku_id%253A393739028%253Bshop_id%253A106849%253BtemplateInfo%253A107881_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=en&location=Pampanga&price=2049&priceCompare=skuId%3A393739028%3Bsource%3Alazada-search-voucher-in-shop%3Bsn%3A64c196621a0ef00ccbfd82974bff2857%3BoriginPrice%3A204900%3BdisplayPrice%3A204900%3BisGray%3Afalse%3BsinglePromotionId%3A-1%3BsingleToolCode%3A-1%3BvoucherPricePlugin%3A0%3Btimestamp%3A1791101879644&ratingscore=4.944444444444445&request_id=64c196621a0ef00ccbfd82974bff2857&review=18&sale=68&search=1&spm=a2o4l.store_keyword.list.7&stock=1'
  ),
  (
    26,
    'shopee',
    'https://shopee.ph/Aircon-Evaporator-Honda-CRV-gen-2-i.329965539.16067031514?extraParams=%7B%22display_model_id%22%3A125726752701%2C%22model_selection_logic%22%3A3%7D'
  );

INSERT INTO compatibility (
  product_id,
  model_id,
  year_from,
  year_to,
  status,
  source
) VALUES
  -- Nissan Terra
  (
    1,
    'nissan-terra',
    2018,
    2026,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra (2018-)”.'
  ),
  (
    2,
    'nissan-terra',
    2018,
    2026,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra 2018-Up”.'
  ),
  (
    3,
    'nissan-terra',
    2018,
    2026,
    'confirmed',
    'Supplied under Terra. Listing title: “Nissan Terra (2018-current)”.'
  ),
  -- Nissan Navara Calibre E
  (
    2,
    'nissan-navara-calibre-e',
    2014,
    2026,
    'confirmed',
    'Supplied under Navara. Listing title: “Navara NP300 Calibre 2014-Up”.'
  ),
  (
    3,
    'nissan-navara-calibre-e',
    2014,
    2020,
    'confirmed',
    'Supplied under Navara. Listing title: “Nissan Navara NP300 EL Calibre (2014-2020)”.'
  ),
  (
    3,
    'nissan-navara-calibre-e',
    2021,
    2026,
    'needs_verification',
    'Supplied under the Navara Calibre E 2021 reference vehicle, but the listing title states 2014–2020. Not shown for 2021 onward until fitment is confirmed.'
  ),
  (
    1,
    'nissan-navara-calibre-e',
    2016,
    2026,
    'needs_verification',
    'Listing title also names “NP300 El (2016 upwards)”, but this listing was supplied for Terra only. Confirm Navara Calibre E fitment before enabling.'
  ),
  (
    4,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Navara Calibre E. Lazada only; listing title and year range not recorded.'
  ),
  (
    5,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Navara. Listing title mentions “Navara 2010”, which does not establish fitment for the Navara Calibre E (2021 reference vehicle).'
  ),
  (
    6,
    'nissan-navara-calibre-e',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Navara. Lazada only; listing title and year range not recorded.'
  ),
  -- Nissan Almera / Versa
  (
    7,
    'nissan-almera-versa',
    2014,
    2020,
    'confirmed',
    'Supplied under Almera. Listing title: “Nissan Almera AIR Filter 1.5L (2014-2020)”. 1.5L engine only.'
  ),
  (
    8,
    'nissan-almera-versa',
    2013,
    2021,
    'confirmed',
    'Supplied under Almera. Listing title: “Nissan Almera 1.2L 2013-2021 Cabin Air filter”.'
  ),
  (
    9,
    'nissan-almera-versa',
    2000,
    2016,
    'confirmed',
    'Supplied under Almera as “2016 below”. Listing title: “Nissan Almera (2016 below)”. “Below” is recorded as from 2000.'
  ),
  (
    10,
    'nissan-almera-versa',
    2017,
    2026,
    'confirmed',
    'Supplied under Almera as “2017-2026”. Lazada only; the listing title is not recorded, so the year range comes from the supplied list.'
  ),
  -- Suzuki Ertiga
  (
    11,
    'suzuki-ertiga',
    2019,
    2026,
    'confirmed',
    'Supplied under Ertiga. Listing title: “Suzuki Ertiga All new (2019 up)”.'
  ),
  (
    12,
    'suzuki-ertiga',
    2019,
    2026,
    'confirmed',
    'Supplied under Ertiga. Listing title: “Suzuki Ertiga All new (2019 up)”.'
  ),
  (
    13,
    'suzuki-ertiga',
    2014,
    2018,
    'confirmed',
    'Supplied under Ertiga. Listing title: “Ertiga (2014-2018)”.'
  ),
  -- Suzuki S-Presso
  (
    14,
    'suzuki-s-presso',
    2020,
    2023,
    'confirmed',
    'Supplied under S-Presso. Listing title: “Suzuki S-PRESSO (Spresso) (2020-2023) non ags”. Non-AGS variants only.'
  ),
  (
    15,
    'suzuki-s-presso',
    2020,
    2023,
    'confirmed',
    'Supplied under S-Presso. Listing title: “Suzuki S-PRESSO (Spresso) (2020-2023) NON AGS”. Non-AGS variants only.'
  ),
  -- Suzuki Jimny
  (
    16,
    'suzuki-jimny',
    2019,
    2026,
    'confirmed',
    'Supplied under Jimny. Listing title: “Suzuki Jimny 2019 up Air Filter”.'
  ),
  (
    17,
    'suzuki-jimny',
    2019,
    2026,
    'confirmed',
    'Supplied under Jimny. Listing title: “Suzuki Jimny 2019 up Charcoal Cabin Filter”.'
  ),
  (
    18,
    'suzuki-jimny',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under Jimny. Lazada only; listing title and year range not recorded.'
  ),
  -- Honda City
  (
    19,
    'honda-city',
    2021,
    2023,
    'confirmed',
    'Supplied under City. Listing title: “Honda City GN 2021-2023 Honda City GN Hatch and all new Honda City GN”.'
  ),
  (
    20,
    'honda-city',
    NULL,
    NULL,
    'needs_verification',
    'Supplied under City. Listing title names City but says “check YR in details”, so no year range is recorded.'
  ),
  (
    21,
    'honda-city',
    2009,
    2013,
    'confirmed',
    'Supplied under City. Listing title: “Honda City GM2 Evaporator coil laminated 2009-2013 (Transformer)”.'
  ),
  (
    22,
    'honda-city',
    2009,
    2014,
    'confirmed',
    'Supplied under City. Listing title: “City GM 09-14 Evaporator Blower Motor”.'
  ),
  -- Honda Civic FD
  (
    23,
    'honda-civic-fd',
    2006,
    2011,
    'confirmed',
    'Supplied under Civic FD. Listing title: “HONDA Civic FD 2.0L 2006-2011 17220-RRA-A00”. 2.0L engine only.'
  ),
  (
    24,
    'honda-civic-fd',
    2006,
    2011,
    'confirmed',
    'Supplied under Civic FD. Listing title: “Civic FD FB 2006-2015”. Limited to the FD years (2006–2011).'
  ),
  -- Honda CR-V
  (
    24,
    'honda-cr-v',
    2007,
    2016,
    'confirmed',
    'Lazada link supplied under CR-V. Listing title: “CR-V 2007-2016”.'
  ),
  (
    25,
    'honda-cr-v',
    2007,
    2016,
    'confirmed',
    'Supplied under CR-V. Listing title: “CRV gen 3 and 4 cabin aircon filter (2007-2016)”.'
  ),
  (
    26,
    'honda-cr-v',
    2001,
    2006,
    'confirmed',
    'Supplied under CR-V. Listing title: “Honda CRV gen 2”. Years set to the gen 2 production run (2001–2006).'
  );

COMMIT;
