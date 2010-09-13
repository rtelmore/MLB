## Ryan Elmore
## 30 July 2010
## Making a graph for Bill Simmons

## from this article
## http://sports.espn.go.com/espn/page2/story?page=simmons/100729

## Copyright (c) 2010, under the Simplified BSD License.  
## For more information on FreeBSD see: 
##      http://www.opensource.org/licenses/bsd-license.php
## All rights reserved.                      

setwd("~/Side_Projects/Sports/MLB/Simmons/")
library(ggplot2)

## His Data
sim.dat <- read.table("data/baseball_rs_game_times.txt", header = T)
ggplot(data = sim.dat, aes(x = Year, y = Count, fill = Cat)) + 
  geom_bar(width = 1, stat = 'identity') + 
  scale_fill_discrete(name = "length category") + 
  scale_x_continuous("year") + 
  scale_y_continuous("games")

## Show in presentation
p <- ggplot(data = sim.dat, aes(x = as.factor(Year), y = Count, fill = Cat))

p <- p + geom_bar(stat = 'identity') 

p + scale_fill_discrete(name = "length", breaks = unique(sim.dat$Cat),
                      labels = c("(,2]","(2,2.30]","(2.30,3]","(3,4]","(4,)")) + 
  scale_x_discrete("year") + 
  scale_y_continuous("games")

ggsave("~/Sports/Simmons/mlb_length_1.png", hei = 7, wid = 7)

ggplot(sim.dat, aes(Cat, y = Count, col = Count, fill = Count)) + 
  geom_bar() + 
  facet_wrap(~ Year) 

last_plot() + scale_y_continuous("number of games") + 
  scale_colour_continuous("games") + 
  scale_fill_continuous("games") + 
  scale_x_discrete("length of games")
	
ggsave("~/Sports/Simmons/mlb_length_2.png",hei=7,wid=7)


## My analysis
file.str <- "~/Side_Projects/Sports/Simmons/length_of_baseball_games_20100802.csv"
rs.dat <- read.csv(file.str, header = F)
names(rs.dat) <- c("team", "year", "mean_len", "med_len", "std_len", "league",
                   "TNAT")

ggplot(data = rs.dat, aes(x = year, y = team, fill = med_len)) + 
  geom_tile() + 
  scale_fill_continuous("minutes")

last_plot() + geom_vline(x=c(1993,2004),lty=3)

ggsave("~/Sports/Simmons/mlb_length_3.png",hei=7,wid=7)

rs.dat$bs <- rs.dat$team == 'BOS'

qplot(x = year, y = med_len, data = rs.dat, geom = c("point","smooth"), 
      span = .5, colour = bs, ylab = "length of game in minutes")
last_plot() + scale_colour_discrete(name = "Boston?")
last_plot() + geom_vline(x = c(1993,2004), lty = 2, col = "black")
ggsave("~/Sports/Simmons/mlb_length_5.png", hei = 7, wid = 7)

rs.dat$nyy <- rs.dat$team=='PHI'
qplot(x = year, y = med_len, data = rs.dat, geom = c("point","smooth"), 
  span = .5, colour = nyy, ylab = "length of game in minutes")

last_plot() + scale_colour_discrete(name = "Boston?")
last_plot() + geom_vline(x = c(1993,2004), lty = 2, col = "black")
ggsave("~/Sports/Simmons/mlb_length_5.png", hei = 7, wid = 7)

qplot(x = year, y = med_len, data = rs.dat, geom = c("point","smooth"), 
      span = .5, ylab = "length of game in minutes")

last_plot() + geom_vline(x = c(1993,2004), lty = 2, col = "red")

ggsave("~/Sports/Simmons/mlb_length_4.png", hei = 7, wid = 7)

## NL vs AL
qplot(x = year, y = med_len, data = rs.dat, geom = c("point","smooth"), 
      span = .5, colour = league, ylab = "length of game in minutes")
