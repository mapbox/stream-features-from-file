'use strict';

const test = require('tape');
const path = require('path');
const fs = require('fs');
const geojsonhint = require('@mapbox/geojsonhint');
const streamFeaturesFromFile = require('..');

const getFixturePath = (fileName) => path.join(__dirname, 'fixtures', fileName);

test('missing file', (assert) => {
  const fixturePath = getFixturePath('i/do/not/exist.geojson');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('ENOENT') === 0, 'expected error');
      assert.end();
    })
    .on('end', assert.end);
});

test('invalid filetype', (assert) => {
  const fixturePath = getFixturePath('invalid-filetype.tif');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.equals(err.message, 'Unknown file type "tif": accepts .geojson, .csv, or .shp', 'expected error message');
      assert.equals(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', assert.end);
});

test('valid GeoJSON FeatureCollection', (assert) => {
  const fixturePath = getFixturePath('valid-feature-collection.geojson');
  const fixtureContent = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  let featureCount = 0;
  let invalid = false;
  streamFeaturesFromFile(fixturePath)
    .on('data', (feature) => {
      featureCount += 1;
      if (geojsonhint.hint(feature).length > 0) invalid = true;
      const expectedFeatureMatchingId = fixtureContent.features.find((expectedFeature) => {
        return expectedFeature.id === feature.id;
      });
      assert.deepEqual(feature, expectedFeatureMatchingId, `feature ${feature.id} matches original`);
    })
    .on('end', () => {
      assert.equal(invalid, false, 'valid GeoJSON');
      assert.equal(featureCount, fixtureContent.features.length, 'expected feature count');
      assert.end();
    })
    .on('error', assert.end);
});

test('invalid GeoJSON: bad JSON', (assert) => {
  const fixturePath = getFixturePath('invalid-bad-json.geojson');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('Invalid JSON') !== -1, 'expected error');
      assert.equal(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', assert.end);
});

test('invalid GeoJSON: Feature, not FeatureCollection', (assert) => {
  const fixturePath = getFixturePath('invalid-feature.geojson');

  let featureCount = 0;
  streamFeaturesFromFile(fixturePath)
    .on('data', () => {
      featureCount += 1;
    })
    .on('end', () => {
      assert.equal(featureCount, 0, 'no features streamed');
      assert.end();
    })
    .on('error', assert.end);
});

test('valid CSV', (assert) => {
  const fixturePath = getFixturePath('valid-features.csv');

  const expectedFeatures = [
    {
      type: 'Feature',
      properties: {
        id: 'bananaOne',
        lng: 1,
        lat: 0,
      },
      geometry: {
        type: 'Point',
        coordinates: [1, 0],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'fooBar',
        lng: 2,
        lat: 2,
      },
      geometry: {
        type: 'Point',
        coordinates: [2, 2],
      },
    },
  ];

  let featureCount = 0;
  let invalid = false;
  streamFeaturesFromFile(fixturePath)
    .on('data', (feature) => {
      featureCount += 1;
      if (geojsonhint.hint(feature).length > 0) invalid = true;
      const expectedFeatureMatchingId = expectedFeatures.find((expectedFeature) => {
        return expectedFeature.properties.id === feature.properties.id;
      });
      assert.deepEqual(feature, expectedFeatureMatchingId, `feature ${feature.properties.id} matches original`);
    })
    .on('end', () => {
      assert.equal(invalid, false, 'valid GeoJSON');
      assert.equal(featureCount, 2, 'expected feature count');
      assert.end();
    })
    .on('error', assert.end);
});

test('invalid CSV: one bad feature', (assert) => {
  const fixturePath = getFixturePath('invalid-features.csv');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('Failed to parse Latitude') === 0, 'expected error');
      assert.equal(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', () => {
      assert.fail('should have errored');
      assert.end();
    });
});

test('invalid CSV: no lng, lat columns', (assert) => {
  const fixturePath = getFixturePath('invalid-not-geo.csv');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('Unable to parse file') !== -1, 'expected error');
      assert.equal(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', () => {
      assert.fail('should have errored');
      assert.end();
    });
});

test('invalid CSV: malformed', (assert) => {
  const fixturePath = getFixturePath('invalid-format.csv');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('CSV Plugin') === 0, 'expected error');
      assert.equals(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', () => {
      assert.fail('should have errored');
      assert.end();
    });
});

test('valid Shapefile', (assert) => {
  const fixturePath = getFixturePath('valid-shp/valid-shp.shp');

  let featureCount = 0;
  let invalid = false;
  streamFeaturesFromFile(fixturePath)
    .on('data', (feature) => {
      featureCount += 1;
      if (geojsonhint.hint(feature).length > 0) invalid = true;
    })
    .on('end', () => {
      assert.equal(invalid, false, 'valid GeoJSON');
      assert.equal(featureCount, 1081, 'expected feature count');
      assert.end();
    })
    .on('error', assert.end);
});

test('invalid Shapefile: missing peer files', (assert) => {
  const fixturePath = getFixturePath('invalid-missing-files-shp/invalid-missing-files-shp.shp');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('Shape Plugin') === 0, 'expected error');
      assert.equals(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', assert.end);
});

test('invalid Shapefile: corrupted', (assert) => {
  const fixturePath = getFixturePath('invalid-corrupted-shp/invalid-corrupted-shp.shp');
  streamFeaturesFromFile(fixturePath)
    .on('error', (err) => {
      assert.ok(err, 'errored');
      assert.ok(err.message.indexOf('Shape Plugin') === 0, 'expected error');
      assert.equals(err.code, 'EINVALID', 'expected error code');
      assert.end();
    })
    .on('end', assert.end);
});
