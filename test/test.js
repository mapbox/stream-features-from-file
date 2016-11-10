'use strict';

const test = require('tape');
const path = require('path');
const fs = require('fs');
const streamFeaturesFromFile = require('..');

const getFixturePath = (fileName) => path.join(__dirname, 'fixtures', fileName);

test('valid GeoJSON', (assert) => {
  const fixturePath = getFixturePath('populations-plus.geojson');
  const fixtureFeatures = JSON.parse(fs.readFileSync(fixturePath, 'utf8')).features;

  let featureCount = 0;
  const checkPoints = new Set([5, 12, 75, 189]);
  streamFeaturesFromFile(fixturePath)
    .on('data', (feature) => {
      featureCount += 1;
      if (checkPoints.has(featureCount)) {
        const parsedFeature = JSON.parse(feature);
        delete parsedFeature.id;
        const geonameId = parsedFeature.properties.GEONAMEID;
        const original = fixtureFeatures.find((feature) => feature.properties.GEONAMEID === geonameId);
        assert.deepEqual(parsedFeature, original, `expected feature ${featureCount}`);
      }
    })
    .on('end', () => {
      assert.equal(featureCount, fixtureFeatures.length, 'expected feature count');
      assert.end();
    })
    .on('error', assert.end);
});

test('valid CSV', (assert) => {
  streamFeaturesFromFile(getFixturePath('populations-plus.csv'))
    .on('data', (feature) => {
      // console.log(feature)
    })
    .on('end', assert.end)
    .on('error', assert.end);
});
