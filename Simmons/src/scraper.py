#!/usr/bin/python

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

from datetime import date, datetime
import time

import numpy

def get_baseball_soup(team, year):
    ## Change the URL here
    # url = "file:///Users/relmore/Sports/Simmons/%s_%s.html" % (year, team)
    url = "http://www.baseball-reference.com/teams/%s/%s-schedule-scores.shtml" 
        % (team,year)
    request = urllib2.Request(url)

    response = urllib2.urlopen(request)
    the_page = response.read()
    try:
        soup = BeautifulSoup(the_page)
    except:
        the_page = re.sub('</scr', '<\/scr', the_page)
        soup = BeautifulSoup(the_page)

    return soup

def process_soup(soup):
    data = soup.findAll('a', href=True)
    data_new = [link for link in data if \
        link['href'].startswith('/games/standings')]
    mins = []
    for stew in data_new:
        ll = stew.findParent('td').findParent('tr')
        hm = [str(td.string) for td in ll.findAll('td')][17].split(':')
        try:
            mins.append(int(hm[0])*60 + int(hm[1]))
        except:
            pass
    return mins
    # for min in mins:
    #     print min    

if __name__ == '__main__':
    teams = {
        'ATL':'N', 'CHC':'N', 'CIN':'N', 'HOU':'N', 'NYM':'N', 'PHI':'N',
        'PIT':'N', 'SDP':'N', 'SFG':'N', 'STL':'N', 'WSN':'N', 'MIL':'N',
        'BAL':'A', 'BOS':'A', 'CHW':'A', 'CLE':'A', 'DET':'A', 'KCR':'A',
        'ANA':'A', 'LAD':'A', 'MIN':'A', 'NYY':'A', 'OAK':'A', 'TEX':'A'}
    outfile = '/Users/relmore/Sports/Simmons/length_of_games_%s.csv' %                     
                date.today().strftime('%Y%m%d')
    f = open(outfile,'a')

    for team in teams:
        out_list = []
        print time.ctime() + ' -- Getting data for the %s'% (team)
        for year in xrange(1970, 2010):
            league = teams[team]
            team_2 = team
            if (int(year) < 1997 and team == 'ANA'):
                team_2 = 'CAL'
            if (int(year) < 1998 and team == 'MIL'):
                league = 'A'
            if (int(year) < 2005 and team == 'WSN'):
                team_2 = 'MON'
            if (int(year) < 1972 and team == 'TEX'):
                team_2 = 'WSA'
            soup = get_baseball_soup(team_2, year)
            mins = process_soup(soup)
            
            out_list.append('%s, %s, %s, %s, %s, %s, %s' % \
                (team, year, numpy.mean(mins), numpy.median(mins), \
                    numpy.std(mins), league, team_2))
        f.write('\n'.join(out_list) + '\n')
    f.close()
    print time.ctime() + ' -- Finished! :) '
