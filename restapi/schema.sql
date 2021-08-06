PRAGMA foreign_keys = ON;

create table Matches(
	id TEXT primary key not null,
	player_id TEXT not null,
	map TEXT not null,
	mode TEXT not null,
    date DATETIME not null,
    duration_seconds NUMBER not null,
    rounds_won NUMBER not null,
    rounds_lost NUMBER not null,
    kills NUMBER not null,
    killshs NUMBER not null,
    deaths NUMBER not null,
    assists NUMBER not null,
    score NUMBER not null,
    mvps NUMBER not null,
    over NUMBER not null
);

create table Rounds(
    id TEXT primary key not null,
    match_id TEXT not null,
    n_round NUMBER not null,
    team TEXT not null,
    equip_value NUMBER not null,
    init_money NUMBER not null,
    init_armor NUMBER not null,
    helmet NUMBER not null,
    duration_seconds NUMBER not null,
    winner TEXT not null,
    win_type TEXT not null,
    died NUMBER not null,
    kills NUMBER not null,
    killshs NUMBER not null,
    assists NUMBER not null,
    score NUMBER not null,
    mvp NUMBER not null,
    FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
);