## Ryan Elmore
## 1 Aug 2010
## Writing a scraper for baseball-reference.com

## Copyright (c) 2010, under the Simplified BSD License.  
## For more information on FreeBSD see: 
##      http://www.opensource.org/licenses/bsd-license.php
## All rights reserved.                      

import urllib
import urllib2

from BeautifulSoup import BeautifulSoup
import re

from datetime import date, time, datetime

request = urllib2.Request("file:///Users/relmore/Sports/Simmons/2009_Reds.html")
response = urllib2.urlopen(request)

the_page = response.read()
the_page = re.sub('</scr', '<\/scr', the_page)
soup = BeautifulSoup(the_page)
for tr in soup.findAll('tr'):
    print tr
    
data = soup.findAll('a', href=True)
data_new = [link for link in data if link['href'].startswith('http://www.baseball-reference.com/games/standings')]        

for link in data:
    if link['href'].startswith('http://www.baseball-reference.com/games/standings'):
        print link

for stew in data_new:
    ll = stew.findParent('td').findParent('tr')
    # 18th element is the time in minutes
    hm = [str(td.string) for td in ll.findAll('td')][17].split(':')
    mins = int(hm[0])*60 + int(hm[1])
    print (mins, hm)

    for td in ll.findAll('td'):
        a = td.findAll('a')
        if len(a) > 0:
            print a.value
        
        if len(a) > 0:
            tmp = a.string
            print tmp        
    
ll = data_new[0].findParent('td').findParent('tr')


[td.string for td in ll.findAll('td')][17]

for l in ll:
    if l['']
link in soup.findAll('a'): if link['href'].startswith('http://'): print links 

re.compile("http://www.baseball-reference.com/games/standings^"))

tabel
sports = soup.findAll('a', href=re.compile("/sports/"))
sports = soup.findAll('a', {'href':re.compile("/sports/")})
for sport in sports:
	print str(sport)