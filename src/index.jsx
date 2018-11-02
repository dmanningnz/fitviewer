import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import 'cesium/Source/Widgets/widgets.css';
import BuildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
BuildModuleUrl.setBaseUrl('./static/Cesium/');

import App from './App'

const root = document.getElementById('root')
const load = () => render((
  <AppContainer>
    <App />
  </AppContainer>
), root)

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./App', load)
}

load()
