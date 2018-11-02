import { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

function padToTwoDigits(digits) {
	return ("00" + digits).slice(-2);
}

function formatAsPace(metersPerSecond) {
	let secondsPerKm = 1000 / metersPerSecond;
	return formatDuration(secondsPerKm);
}

function formatDuration(seconds) {
	let secondsRemaining = seconds;
	let hours = Math.floor(secondsRemaining / 3600);
	secondsRemaining = secondsRemaining - (3600 * hours);
	let minutes = Math.floor(secondsRemaining / 60);
	secondsRemaining = Math.round(secondsRemaining - (60 * minutes));
	let result = `${padToTwoDigits(minutes)}:${padToTwoDigits(secondsRemaining)}`;
	if (hours) {
		result = `${padToTwoDigits(hours)}:${result}`;
	}
	return result;
}

function formatDistance(meters) {
	if (meters < 1000) {
		return `${Math.round(meters)}m`;
	} else {
		return `${(meters / 1000).toFixed(2)}km`;
	}
}

function formatHeight(meters) {
	return `${Math.round(meters)}m`;
}

function formatAscentRate(metersPerSecond) {
	let metersPerHour = metersPerSecond * 3600;
	return `${Math.round(metersPerHour)}m/h`;
} 

export class LapTable extends Component {

	render() {
		return <Table>
			<TableHead>
				<TableRow>
					<TableCell>Lap</TableCell>
					<TableCell>Time</TableCell>
					<TableCell>Distance</TableCell>
					<TableCell>Avg Pace</TableCell>
					<TableCell>Avg Heart Rate</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{this.props.laps.map((lap, i) => 
					<TableRow hover key={i} onMouseEnter={() => this.props.onRowEnter(lap)} >
						<TableCell>{i}</TableCell>
						<TableCell>{formatDuration(lap.total_elapsed_time)}</TableCell>
						<TableCell>{formatDistance(lap.total_distance)}</TableCell>
						<TableCell>{formatAsPace(lap.avg_speed)}</TableCell>
						<TableCell>{Math.round(lap.avg_heart_rate)}</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	}

}

export class ClimbTable extends Component {
	render() {
		return <Table>
			<TableHead>
				<TableRow>
					<TableCell>Lap</TableCell>
					<TableCell>Elapsed Time</TableCell>
					<TableCell>Distance</TableCell>
					<TableCell>Avg Pace</TableCell>
					<TableCell>Avg Heart Rate</TableCell>
					<TableCell>Total Ascent</TableCell>
					<TableCell>Ascent Rate</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{this.props.laps.map((lap, i) => {
					let heightDelta 
					
					return <TableRow key={i} hover onMouseEnter={() => this.props.onRowEnter(lap)}>
							<TableCell>{i}</TableCell>
							<TableCell>{formatDuration(lap.total_elapsed_time)}</TableCell>
							<TableCell>{formatDistance(lap.total_distance)}</TableCell>
							<TableCell>{formatAsPace(lap.avg_speed)}</TableCell>
							<TableCell>{Math.round(lap.avg_heart_rate)}</TableCell>
							<TableCell>{formatHeight(lap.total_ascent)}</TableCell>
							<TableCell>{formatAscentRate(lap.total_ascent / lap.total_elapsed_time)}</TableCell>
						</TableRow>
					}
				)}
			</TableBody>
		</Table>
	}
}

export class DescTable extends Component {
	render() {
		return <Table>
			<TableHead>
				<TableRow>
					<TableCell>Lap</TableCell>
					<TableCell>Elapsed Time</TableCell>
					<TableCell>Distance</TableCell>
					<TableCell>Avg Pace</TableCell>
					<TableCell>Avg Heart Rate</TableCell>
					<TableCell>Descent</TableCell>
					<TableCell>Descent Rate</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{this.props.laps.map((lap, i) => 
					<TableRow key={i} hover onMouseEnter={() => this.props.onRowEnter(lap)}>
						<TableCell>{i}</TableCell>
						<TableCell>{formatDuration(lap.total_elapsed_time)}</TableCell>
						<TableCell>{formatDistance(lap.total_distance)}</TableCell>
						<TableCell>{formatAsPace(lap.avg_speed)}</TableCell>
						<TableCell>{Math.round(lap.avg_heart_rate)}</TableCell>
						<TableCell>{formatHeight(lap.total_descent)}</TableCell>
						<TableCell>{formatAscentRate(lap.total_descent / lap.total_elapsed_time)}</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	}
}