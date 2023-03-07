import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { NflDataService } from '../services/nfl-data.service';
import { SleeperUser } from '../models/sleeper-user';
import { SleeperLeague } from '../models/sleeper-league';
import { SleeperPlayer } from '../models/sleeper-player';

@Component({
  selector: 'app-keepers-shell',
  templateUrl: './keepers-shell.component.html',
  styleUrls: ['./keepers-shell.component.scss']
})
export class KeepersShellComponent implements OnInit {
  userNameSearchValue: string;
  isLoading: boolean;
  userSelected: boolean;
  selectedSleeperUser: SleeperUser;
  userNameError: boolean;
  usersLeagues: SleeperLeague[];
  selectedLeague: SleeperLeague;
  leagueRosterPlayers: SleeperPlayer[];
  isLoadingPlayerData: boolean;
  showingDraftedTooltip: boolean;
  showingFaTooltip: boolean;
  showingTooltipFor: SleeperPlayer;

  constructor(
    private nflDataService: NflDataService
  ) { }

  ngOnInit() {
    this.nflDataService.getAllSleeperPlayers()
      .pipe(take(1))
      .subscribe(() => {});

    // On init grab the local static player adp list:
    this.nflDataService.getCurrentPlayerAdp()
      .pipe(take(1))
      .subscribe(() => {});
  }

  clearSearch() {
    this.userNameSearchValue = '';
    this.userSelected = false;
    this.userNameError = false;
    this.usersLeagues = [];
    this.selectedLeague = null;
    this.leagueRosterPlayers = null;
  }

  searchForUser() {
    this.userSelected = false;
    this.userNameError = false;
    this.isLoading = true;

    this.nflDataService.getSleeperUser(this.userNameSearchValue)
      .pipe(take(1))
      .subscribe((user: SleeperUser) => {
        if (user) {
          this.selectedSleeperUser = user;
          this.getUserLeagues(user.user_id);
        } else {
          this.userNameError = true;
          this.isLoading = false;
        }

        this.userSelected = true;
      });
  }

  private getUserLeagues(userId: string) {
    this.nflDataService.getSleeperLeagues(userId)
      .pipe(take(1))
      .subscribe((leagues: SleeperLeague[]) => {
        if (leagues) {
          this.usersLeagues = leagues;
        }

        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      });
  }

  getUserNameInitial() {
    if (this.userNameSearchValue) {
      return this.userNameSearchValue.substr(0, 1);
    } else {
      return '';
    }
  }

  selectLeague(league: SleeperLeague) {
    this.selectedLeague = league;

    this.nflDataService.getSleeperRosterPlayers(league.league_id, league.draft_id, this.selectedSleeperUser.user_id)
      .pipe(take(1))
      .subscribe(rosterPlayers => {
        if (rosterPlayers) {
          this.leagueRosterPlayers = rosterPlayers;
        }
      });
  }

  clearLeagueSelection() {
    this.selectedLeague = null;
    this.leagueRosterPlayers = null;
  }

  getPlayerClassName(playerPosition: string) {
    switch (playerPosition) {
      case 'QB':
        return 'red';
      case 'RB':
        return 'green';
      case 'WR':
        return 'blue';
      case 'TE':
        return 'orange';
      case 'K':
        return 'purple';
      case 'DEF':
      return 'dark-blue';
    }
  }

  openSettings() {
    console.log('open settings');
  }

  getFormattedPickNo(pickNumber: number) {
    const pickNo = pickNumber / 10 * 1 + 1;
    return pickNumber === 999  ? 'FA' : pickNo.toFixed(1);
  }

  getPlayerKeeperValue(player: SleeperPlayer): number {
    if (player) {
      return (player.pick_no - 1) - player.adp;
    }
  }

  getValueColor(value: number) {
    if (value >= 2) {
      return '#41c7b7';
    } else if (value < 0) {
      return '#f13b7b';
    }
  }

  toggleDraftedTooltip(player: SleeperPlayer, event: any) {
    if (player && player.originallyDrafted &&
        ((event.type === 'mouseenter' && window.innerWidth) > 720 ||
        (event.type === 'mouseleave' && window.innerWidth) > 720 ||
        (event.type === 'click' && window.innerWidth < 721))
      ) {
      this.showingDraftedTooltip = !this.showingDraftedTooltip;
      this.showingFaTooltip = false;

      if (this.showingDraftedTooltip) {
        this.showingTooltipFor = player;
      } else {
        this.showingTooltipFor = undefined;
      }
    }
  }

  toggleFaTooltip(player: SleeperPlayer, event: any) {
    if (player && player.pick_no === 999 &&
        ((event.type === 'mouseenter' && window.innerWidth) > 720 ||
        (event.type === 'mouseleave' && window.innerWidth) > 720 ||
        (event.type === 'click' && window.innerWidth < 721))
       ) {
      this.showingFaTooltip = !this.showingFaTooltip;
      this.showingDraftedTooltip = false;

      if (this.showingFaTooltip) {
        this.showingTooltipFor = player;
      } else {
        this.showingTooltipFor = undefined;
      }
    }
  }
}
