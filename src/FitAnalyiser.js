export function* flattenLaps(session) {
  for (let lap of session.laps) {
    for (let record of lap.records) {
      yield record;
    }
  }
}

export function splitByAscDesc(session) {
    let thres = session.total_ascent / 10;
    let distThres = session.total_distance / 10;
    let marks = [];
    let minAlt = null;
    let maxAlt = null;
    let desc = null;
    let asc = null;
    for (let record of flattenLaps(session)) {
      if (asc) {
        if (maxAlt == null || maxAlt.altitude < record.altitude) {
          maxAlt = record;
        }
        if (maxAlt.altitude - record.altitude > thres || (record.distance - maxAlt.distance > distThres)) {
          marks.push(maxAlt);
          asc = null;
          minAlt = record;
        }
      } else if (desc) {
        if (minAlt == null || minAlt.altitude > record.altitude) {
          minAlt = record;
        }
        if ((record.altitude - minAlt.altitude > thres) || (record.distance - minAlt.distance > distThres)) {
          marks.push(minAlt);
          desc = null;
          maxAlt = record;
        }
      } else {
        if (minAlt == null || minAlt.altitude > record.altitude) {
          minAlt = record;
        }
        if (maxAlt == null || maxAlt.altitude < record.altitude) {
          maxAlt = record;
        }
  
        if (maxAlt.altitude - minAlt.altitude > thres) {
          if (minAlt.elapsed_time < maxAlt.elapsed_time) {
            asc = minAlt;
            marks.push(minAlt);
          } else {
            desc = maxAlt;
            marks.push(maxAlt)
          }
        }
      }

    }
    return marks.filter((m, i, a) => i === 0 || m !== a[i - 1]);
}

export function pathAsGeoJson(records) {
	return {
		type: "LineString",
		coordinates: records.map(r => [r.position_long, r.position_lat, r.altitude]),
	};
}

export function segmentBySplits(session, splits) {
	let laps = [];
	let currentSegment = [];
	let splitQueue = splits.slice();
	for (let record of flattenLaps(session)) {
		currentSegment.push(record);
		if (record == splitQueue[0]) {
      if (currentSegment.length > 1) {
        laps.push(currentSegment);
        currentSegment = [ currentSegment[currentSegment.length - 1] ];
      }
			splitQueue.shift();
		}
  }
  if (currentSegment.length > 1) {
    laps.push(currentSegment);
  }
	return {...session, laps: laps.map(createLap) };
}

function createLap(records) {
  let recordCount = 0;
  let sumCadence = 0;
  let sumHeartRate = 0;
  let sumSpeed = 0;
  let sumTemperature = 0;
  let maxCadence = 0;
  let maxHeartRate = 0;
  let maxSpeed = 0;
  let maxTemperature = 0;

  let startRecord = records[0];
  let endRecord = records[records.length - 1];

  for (let record of records) {
    recordCount++;
    sumCadence += record.cadence;
    sumHeartRate += record.heart_rate;
    sumSpeed += record.speed;
    sumTemperature += record.temperature;

    maxCadence = Math.max(maxCadence, record.cadence);
    maxHeartRate = Math.max(maxHeartRate, record.heart_rate);
    maxSpeed = Math.max(maxSpeed, record.speed);
    maxTemperature = Math.max(maxTemperature, record.temperature);
  }

  let altDelta = endRecord.altitude - startRecord.altitude;

  let lap = {
    records,

    start_time: startRecord.timestamp,
    timestamp: endRecord.timestamp,

    total_distance: endRecord.distance - startRecord.distance,
    total_elapsed_time: endRecord.elapsed_time - startRecord.elapsed_time,
    total_timer_time: endRecord.elapsed_time,

    avg_cadence: sumCadence / recordCount,
    avg_heart_rate: sumHeartRate / recordCount,
    avg_speed: sumSpeed / recordCount,
    avg_temperature: sumTemperature / recordCount,
    max_cadence: maxCadence,
    max_heart_rate: maxHeartRate,
    max_speed: maxSpeed,
    max_temperature: maxTemperature,
  }

  if (altDelta < 0) {
    lap.total_ascent = 0;
    lap.total_descent = -altDelta;
  } else {
    lap.total_ascent = altDelta;
    lap.total_descent = 0;
  }

  return lap;
}

export function asAscDescFeatures(session, splits) {
	let thres = session.total_ascent / 10;
	let features = [];
	let currentSegment = [];
	let splitQueue = splits.slice();
	for (let record of flattenLaps(session)) {
		currentSegment.push(record);
		if (record == splitQueue[0]) {
      if (currentSegment.length > 1) {
        features.push(getClimbFeature(currentSegment, thres));
        currentSegment = [ currentSegment[currentSegment.length - 1] ];
      }
			splitQueue.shift();
		}
  }
  if (currentSegment.length > 1) {
    features.push(getClimbFeature(currentSegment, thres));
  }
	return {
		type: "FeatureCollection",
		features: features,
	};
}

export function lapToFeature(lap, thres) {
  return {
    type: 'Feature',
    geometry: {
      type: "LineString",
      coordinates: lap.records.map(r => [r.position_long, r.position_lat, r.altitude]),
    },
    properties: {
      stroke: lap.total_ascent > thres ? '#ff0000' : (lap.total_descent > thres ? '#0000ff' : '#777777'),
      total_ascent: lap.total_ascent,
      total_descent: lap.total_descent,
      total_distance: lap.total_distance,
      total_elapsed_time: lap.total_elapsed_time,
    }
  };
}

function getClimbFeature(currentSegment, thres) {
  let ascent = currentSegment[currentSegment.length - 1].altitude - currentSegment[0].altitude;
  let distance = currentSegment[currentSegment.length - 1].distance - currentSegment[0].distance;
  let time = currentSegment[currentSegment.length - 1].elapsed_time - currentSegment[0].elapsed_time;
  return {
    type: 'Feature',
    geometry: {
      type: "LineString",
      coordinates: currentSegment.map(r => [r.position_long, r.position_lat, r.altitude]),
    },
    properties: {
      stroke: ascent > thres ? '#ff0000' : (-ascent > thres ? '#0000ff' : '#777777'),
      ascent,
      distance,
      time,
    }
  };
}