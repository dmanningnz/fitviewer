import { Component } from 'react'
import EasyFit from "easy-fit"

export default class FileDrop extends Component {
	window_onDragOver_bind = this.window_onDragOver.bind(this);
	window_onDrop_bind = this.window_onDrop.bind(this);

	render() { return null; }

	componentDidMount() {
		console.log("Drop attached");
		window.addEventListener('dragover', this.window_onDragOver_bind);
		window.addEventListener('drop', this.window_onDrop_bind);
	}

	componentWillUnmount() {
		console.log("Drop unattached");
		window.removeEventListener('drop', this.window_onDrop_bind);
		window.removeEventListener('dragover', this.window_onDragOver_bind);
	}

	window_onDragOver(event) {
		event.preventDefault(); // Stops the browser from handling the drop as "load this file in this tab"
	}

	window_onDrop(event) {
		if (event.dataTransfer && event.dataTransfer.files.length === 1) {
			event.preventDefault();
		
			const file = event.dataTransfer.files[0];
			
			var easyFit = new EasyFit({
				force: true,
				speedUnit: 'm/s',
				lengthUnit: 'm',
				temperatureUnit: 'celcius',
				elapsedRecordField: true,
				mode: 'cascade',
			});
			
			var fileReader = new FileReader();
			fileReader.onload = event => {
				easyFit.parse(event.target.result, (error, data) => {
  
					// Handle result of parse method
					if (error) {
					  console.log(error);
					} else {
						console.log('FIT', data);
						this.props.onLoad && this.props.onLoad(data);
					}
					
				  });
			};
			fileReader.readAsArrayBuffer(file);

			
		}
	}
}