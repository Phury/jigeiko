  
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const ScheduleService = {
  
  getSchedule: function() {
    const uri = '/data/schedule.json';
    return fetch(uri)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      });
  },
  
  getEntriesForDate: function(schedule, date) {
    const scheduleEntries = [];
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
    const weekOfMonth = 0 | (date.getDate() / 7)+1;

    schedule.forEach((elt) => {
      if (weekOfMonth == elt.time.weekOfMonth && dayOfWeek == elt.time.dayOfWeek) {
        scheduleEntries.push(elt);
      }
      if (dayOfWeek == elt.time.dayOfWeek && !elt.time.weekOfMonth) {
        scheduleEntries.push(elt);
      }
    });

    //console.log({date: date, dayOfWeek: dayOfWeek, weekOfMonth: weekOfMonth, scheduleEntries: scheduleEntries});
    return scheduleEntries;
  }
}

const COLORS = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B"];
function hashToColor(str) {
	var hash = 0;
  for (var i = 0, len = str.length; i < len; i++) {
  	hash = hash+str.charCodeAt(i);
  }
  return COLORS[hash % COLORS.length];
}

class DateLabel extends React.Component {
	render() {
  	return (
    	<div className="date">
    	  <div className="day">{this.props.date.getDate()}</div>
        <div className="dayOfWeek">{DAYS_OF_WEEK_SHORT[this.props.date.getDay()]}</div>
      </div>
    );
  }
}

class TimelineActivity extends React.Component {
	render() {
  	return (
    	<div className="card" style={{ backgroundColor: hashToColor(this.props.activity.club) }}>
        <h4>
          <span className="club">{this.props.activity.club}</span>,
          {'\u00A0'}
          <span className="location">{this.props.activity.location.name}</span>
        </h4>
        <span className="time">
          {this.props.activity.time.from}—{this.props.activity.time.to}
        </span>
        <span>
          {this.props.activity.location.address}
        </span>
      </div>
    );
  }
}

class Timeline extends React.Component {
  
  _computeAgenda(schedule, agenda, period) {
    const currDay = new Date(period.from);
    while (currDay <= period.to) {
      agenda.push({ date: new Date(currDay), entries: ScheduleService.getEntriesForDate(schedule, new Date(currDay)) });
      currDay.setDate(currDay.getDate() + 1);
    }
    return agenda;
  }
  
  constructor(props) {
    super(props);
    this.state = { agenda: null, period: null };
    this.showMoreDates = this.showMoreDates.bind(this);
  }
    
  componentDidMount() {
    ScheduleService.getSchedule().then((schedule) => {
      const period = { from: new Date(), to: new Date() };// period starts today
      period.to.setMonth(period.from.getMonth() + 1);// period finishes in 1 months
      this.setState({ 
        schedule: schedule, 
        agenda: this._computeAgenda(schedule, [], period), 
        period: period
      });
      console.log(this.state);
    });    
  }
  
  showMoreDates(e) {
    e.preventDefault();
    const periodToAdd = { from: this.state.period.to, to: new Date() };
    periodToAdd.from.setDate(periodToAdd.from.getDate() + 1);// period starts the next day
    periodToAdd.to.setMonth(periodToAdd.from.getMonth() + 3);// period finishes in 3 months
    this.setState({
      agenda: this._computeAgenda(this.state.schedule, this.state.agenda, periodToAdd), 
      period: { from: this.state.period.from, to: periodToAdd.to } 
    });
    console.log(this.state);
  }
  
  render() {
  	var prevDate = new Date();
  	if (!this.state.agenda) return null;
    return (
      <div className="timeline wow bounceInUp">
        {this.state.agenda.map((activities, i) => {
        	var timelineItem;
        	if (i == 0 || prevDate.getMonth() != activities.date.getMonth()) {
              timelineItem = (
                <section className="timeline-item-with-header" key={i}>
                  <div className="timeline-header">
                    <h3>{MONTHS[activities.date.getMonth()]+" "+activities.date.getFullYear()}</h3>
                  </div>
                  <section className="timeline-item" key={i}>
                    <div className="timeline-icon">
                      <DateLabel date={activities.date} />
                    </div>
                    <div className="timeline-content">
                      {activities.entries && activities.entries.map((elt, j) => {
                        return <TimelineActivity activity={elt}  key={j} />
                      })}
                    </div>
                  </section>
                </section>
              );
            } else {
              timelineItem = (
                <section className="timeline-item" key={i}>
                  <div className="timeline-icon">
                    <DateLabel date={activities.date} />
                  </div>
                  <div className="timeline-content">
                    {activities.entries && activities.entries.map((elt, j) => {
                      return <TimelineActivity activity={elt}  key={j} />
                    })}
                  </div>
                </section>
              );
            }
            prevDate = activities.date;
            return timelineItem;
        })}
        <section className="timeline-action">
          <button type="button" className="btn btn-primary" onClick={this.showMoreDates}>more</button>
        </section>
          
      </div>
    );
  }
}

ReactDOM.render(
  <Timeline />,
  document.getElementById('app')
);
