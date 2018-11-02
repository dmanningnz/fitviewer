import { Component, Fragment } from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import './App.css'
import Plot from 'react-plotly.js'

import FileDrop from './FileDrop'
import Map from './CeisumViewer'
import { LapTable, ClimbTable, DescTable } from './LapTable'
import { splitByAscDesc, pathAsGeoJson, asAscDescFeatures, flattenLaps, segmentBySplits, lapToFeature } from './FitAnalyiser'

export default class App extends Component {
  state = {
    name: 'FitViewer',
    tab: 0,
  };

  changeTab = (event, tab) => {
    this.setState({ tab });
  };

  focusLap = lap => {
    this.setState({ focusLap: lap });
  }

  onHover = eventData => {
    let recordIndex = eventData.points.filter(p => p.curveNumber == 0)[0].pointNumber;
    let lapIndex = 0; 
    while (this.state.data.laps[lapIndex].records.length < recordIndex) {
      recordIndex -= this.state.data.laps[lapIndex].records.length;
      lapIndex++;
    }
    let record = this.state.data.laps[lapIndex].records[recordIndex];
  }

  render () {
    const thres = this.state.data && this.state.data.total_ascent / 10;
    let tables;
    if (this.state.data) {
      tables = <div>
        <Tabs value={this.state.tab} onChange={this.changeTab}>
          <Tab label="Laps" />
          {this.state.lapsByAscDesc && <Tab label="Climbs" />}
          {this.state.lapsByAscDesc && <Tab label="Descents" />}
        </Tabs>
        {this.state.tab === 0 && <LapTable laps={this.state.data.laps} onRowEnter={this.focusLap} />}
        {this.state.tab === 1 && this.state.lapsByAscDesc && <ClimbTable laps={this.state.lapsByAscDesc.laps.filter(l => l.total_ascent > thres)} onRowEnter={this.focusLap} />}
        {this.state.tab === 2 && this.state.lapsByAscDesc && <DescTable laps={this.state.lapsByAscDesc.laps.filter(l => l.total_descent > thres)} onRowEnter={this.focusLap} />}
      </div>;
    }

    let shapes = [];
    let layers = {
      path: { data: this.state.geoJson, options: { clampToGround: true } },
      focus: null,
    };
    if (this.state.focusLap) {
      shapes.push({
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        y0: 0,
        y1: 1,
        x0: this.state.focusLap.records[0].distance,
        x1: this.state.focusLap.records[this.state.focusLap.records.length - 1].distance,
        fillcolor: '#d3d3d3',
        opacity: 0.2,
        line: {
          width: 0,
        }
      });

      layers.focus = {
        type: "FeatureCollection",
        features: [lapToFeature(this.state.focusLap, this.state.data.activity.sessions[0].total_ascent / 10)],
      };
    }

    return (
      <div>
        <FileDrop onLoad={this.onLoad} />
        {this.state.orig && <button onClick={() => this.onLoad(this.state.orig)}>Refresh</button>}
        <div style={{display: 'flex'}}>
          <div style={{flex: '2 1 auto'}}>
          <Map layers={{ 
            path: { data: this.state.geoJson, options: { clampToGround: true } }
          }} startAtLayer="path" />
          </div>
          <div style={{flex: '1 1 auto'}}>
            <div style={{ height: '400px' }}>
              {this.state.data && <Plot
                data={[
                  {
                    x: [...flattenLaps(this.state.data)].map(r => r.distance),
                    y: [...flattenLaps(this.state.data)].map(r => r.altitude),
                    type: 'scatter',
                    mode: 'lines',
                    marker: { color: 'red' }
                  },
                  {
                    x: this.state.transitions.map(r => r.distance),
                    y: this.state.transitions.map(r => r.altitude),
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: 'blue' }
                  },
                ]}
                layout={{
                  autosize: true,
                  shapes: shapes,
                }}
                useResizeHandler={true}
                onHover={}
              />}
            </div>
            {this.state.data && tables}
          </div>
        </div>
      </div>
    )
  }

  onLoad = (data) => {
    let splits = splitByAscDesc(data.activity.sessions[0]);
    let lapsByAscDesc = segmentBySplits(data.activity.sessions[0], splits);
    let geoJson = {
      type: "FeatureCollection",
      features: lapsByAscDesc.laps.map(l => lapToFeature(l, data.activity.sessions[0].total_ascent / 10)),
    };
    console.log('features', geoJson);
    this.setState({ orig: data, data: data.activity.sessions[0], transitions: splits, lapsByAscDesc, geoJson });
  }
}
