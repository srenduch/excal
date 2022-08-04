from math import floor
from datetime import datetime

def calc_time_rem(due_date_str) :
    time_remaining = datetime.strptime(due_date_str, '%Y-%m-%d %H:%M') - datetime.now()
    days = time_remaining.days
    hours = floor(time_remaining.seconds / 3600)
    mins = floor((time_remaining.seconds - hours*3600) / 60)
    secs = time_remaining.seconds - (hours*3600 + mins*60)
    time_remaining = f"{days:02d}:{hours:02d}:{mins:02d}:{secs:02d}"

    return time_remaining