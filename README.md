ae_ecudata
==========

Script for collecting ecu log data from cvs file and importing it into after effects.

The current supported log format is that of which VIPEC pushes out by default:

name,log name, time
	
empty line

headers

units

empty line

data with timestamp in seconds as the first row


all the fields are contained within double quotes.