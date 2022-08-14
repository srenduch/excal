from datetime import datetime

def calc_time_rem(date_str) :
    due_date = datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S') 
    now = datetime.now().replace(microsecond=0)
    time_remaining = due_date - now
    days = time_remaining.days
    hours, remainder = divmod(time_remaining.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    time_remaining = f"{days:02d}:{hours:02d}:{minutes:02d}:{seconds:02d}"

    return time_remaining