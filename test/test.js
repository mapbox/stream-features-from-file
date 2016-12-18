'use strict';

const test = require('tape');
const path = require('path');
const fs = require('fs');
const geojsonhint = require('@mapbox/geojsonhint');
const streamFeaturesFromFile = require('..');

const getFixturePath = (fileName) => path.join(__dirname, 'fixtures', fileName);

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

test('valid GeoJSON Feature', (assert) => {
  const fixturePath = getFixturePath('valid-feature.geojson');
  const fixtureContent = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  let featureCount = 0;
  let invalid = false;
  streamFeaturesFromFile(fixturePath)
    .on('data', (feature) => {
      featureCount += 1;
      if (geojsonhint.hint(feature).length > 0) invalid = true;
      assert.equal(geojsonhint.hint(feature).length, 0, 'feature is valid');
      assert.deepEqual(feature, fixtureContent, 'feature matches original');
    })
    .on('end', () => {
      assert.equal(invalid, false, 'valid GeoJSON');
      assert.equal(featureCount, 1, 'expected feature count');
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
