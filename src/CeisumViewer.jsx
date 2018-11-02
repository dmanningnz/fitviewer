import { Component } from 'react';
import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource';
import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain';

export default class ReactViewer extends Component {
    dataSources = {};

    componentDidMount() {
        this.viewer = new Viewer(this.cesiumContainer, {
            terrainProvider : createWorldTerrain({ requestVertexNormals: true }),
        });
        updateLayers(prop.layers, {});
        if (this.props.startAtLayer) {
            this.viewer.flyTo(this.dataSources[this.props.startAtLayer]);
        }
        
    }

    componentWillReceiveProps(nextProps) {
        updateLayers(nextProps.layers, this.props.layers);
    }

    render() {
        return (
            <div>
                <div id="cesiumContainer" ref={ element => this.cesiumContainer = element }/>
            </div>
        );
    }

    updateLayers(layers, prevLayers) {
        for (let key in layers) {
            if (layers[key] != prevLayers[key]) {
                if (!this.dataSources[key]) {
                    this.dataSources[key] = new GeoJsonDataSource(key);
                    this.viewer.dataSources.add(this.dataSource);
                }
                let dataSource = this.dataSources[key];
                dataSource.load(layers[key].data || {}, layers[key].options);
            }
        }
    }
}