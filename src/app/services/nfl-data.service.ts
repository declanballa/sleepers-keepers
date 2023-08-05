import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SleeperUser } from '../models/sleeper-user';
import { SleeperLeague } from '../models/sleeper-league';
import { SleeperPlayer } from '../models/sleeper-player';
import { PlayerAdp } from '../models/player-adp';

@Injectable({
  providedIn: 'root'
})
export class NflDataService {
  playerList: SleeperPlayer[];
  playerAdpList: PlayerAdp[];

  constructor(
    private http: HttpClient
  ) { }

  getAllSleeperPlayers() {
    this.playerList = [] as SleeperPlayer[];

    const url = './assets/nfl-player-list-080523.json';

    return this.http.get(url)
      .pipe(
        map(playerData => {
          if (playerData) {
            const players = this.mapSleeperPlayer(playerData);

            this.playerList = players;
          }
        })
      );
  }

  private mapSleeperPlayer(playerData: any): SleeperPlayer[] {
    const players = [] as SleeperPlayer[];

    Object.keys(playerData).forEach(playerId => {
      const player = playerData[playerId];

      // Only use offensive players:
      if (this.isValidPosition(player.position) && player.team) {
        players.push({
          player_id: player.player_id,
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          team: player.team
        } as SleeperPlayer);
      }
    });

    return players;
  }

  private isValidPosition(position: string): boolean {
    const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

    return validPositions.indexOf(position) !== -1;
  }

  getCurrentPlayerAdp() {
    this.playerAdpList = [] as PlayerAdp[];

    const url = './assets/nfl-player-adp-080523.json';

    return this.http.get(url)
      .pipe(
        map(playerAdpData => {
          if (playerAdpData) {
            const playersAdp = this.mapPlayerAdp(playerAdpData);

            this.playerAdpList = playersAdp;
          }
        })
      );
  }

  private mapPlayerAdp(playerAdpData: any): PlayerAdp[] {
    const playersAdpList = [] as PlayerAdp[];

    playerAdpData.forEach(player => {
      playersAdpList.push({
        first_name: player.Player.split(' ')[0],
        last_name: player.Player.split(' ')[1],
        adp: player.AVG
      } as PlayerAdp);
    });

    return playersAdpList;
  }

  getSleeperUser(username: string): Observable<SleeperUser> {
    const url = `https://api.sleeper.app/v1/user/${username}`;

    return this.http.get(url)
      .pipe(
        map(userData => {
          if (userData) {
            const user = this.mapSleeperUser(userData);

            return user;
          } else {
            return null;
          }
        })
      );
  }

  private mapSleeperUser(userData: any): SleeperUser {
    return {
      username: userData.username,
      user_id: userData.user_id
    } as SleeperUser;
  }

  getSleeperLeagues(userId: string): Observable<SleeperLeague[]> {
    const url = `https://api.sleeper.app/v1/user/${userId}/leagues/nfl/2022`;

    return this.http.get(url)
      .pipe(
        map(leagueData => {
          if (leagueData) {
            const leagues = this.mapSleeperLeagues(leagueData);

            return leagues;
          } else {
            return null;
          }
        })
      );
  }

  private mapSleeperLeagues(leagueData: any): SleeperLeague[] {
    const leagues = [] as SleeperLeague[];

    leagueData.forEach(league => {
      // We don't want dynasty leagues since they don't have keepers:
      if (league.settings && league.settings.type !== 2) {
        leagues.push({
          name: league.name,
          league_id: league.league_id,
          draft_id: league.draft_id
        } as SleeperLeague);
      }
    });

    return leagues;
  }

  getSleeperRosterPlayers(leagueId: string, draftId: string, userId: string): Observable<SleeperPlayer[]> {
    const rostersUrl = `https://api.sleeper.app/v1/league/${leagueId}/rosters`;

    return this.http.get(rostersUrl)
      .pipe(
        switchMap(rosterData => {
          if (rosterData) {
            const players = this.mapSleeperRosterPlayers(rosterData, userId);
            const draftResultsUrl = `https://api.sleeper.app/v1/draft/${draftId}/picks`;

            return this.http.get(draftResultsUrl)
              .pipe(
                map((draftResultsData: any[]) => {
                  const mappedPlayers = [] as SleeperPlayer[];

                  if (draftResultsData) {
                    players.forEach(rosteredPlayer => {
                      if (draftResultsData.filter(p => p.player_id === rosteredPlayer.player_id).length > 0) {
                        draftResultsData.map(p => p.player_id === rosteredPlayer.player_id && mappedPlayers.push({
                          ...rosteredPlayer,
                          pick_no: parseInt((p.pick_no).toString().split('.')[1], 10) === 1 ? (p.pick_no + 0.1) : p.pick_no,
                          originallyDrafted: p.picked_by === userId ? true : false
                        } as SleeperPlayer));
                      } else {
                        mappedPlayers.push({
                          ...rosteredPlayer,
                          pick_no: 999 // fa marker
                        });
                      }
                    });
                  }

                  mappedPlayers.forEach(player => {
                    const pickNumber = player.pick_no === 999 ? 11 : player.pick_no / 10 * 1 + 1;
                    player.value = (pickNumber - 1) - (player.adp / 10 * 1 + 1);
                  });

                  return mappedPlayers.sort((a, b) => (b.value - a.value));
                })
              );
          }
        })
      );
  }

  private mapSleeperRosterPlayers(leagueRosterData: any, userId: string): SleeperPlayer[] {
    const players = [] as SleeperPlayer[];

    leagueRosterData.forEach(team => {
      if (team.owner_id === userId && team.players) {
        team.players.forEach(playerId => {
          this.playerList.map(p => p.player_id === playerId && players.push({
            ...p,
            adp: this.playerAdpList.filter(pAdp => pAdp.first_name === p.first_name && pAdp.last_name === p.last_name)[0] ?
            this.playerAdpList.filter(pAdp => pAdp.first_name === p.first_name && pAdp.last_name === p.last_name)[0].adp :
            0
          }));
        });
      }
    });

    return players;
  }
}
