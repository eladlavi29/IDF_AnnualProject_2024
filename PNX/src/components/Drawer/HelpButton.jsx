import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import InfoRoundedIcon from '@mui/icons-material/InfoRounded';

export default function renderHistory(){
    return(
    <div>
        <List>
            <ListItem key={'Help'} disablePadding>
                <ListItemButton>
                <ListItemIcon>
                <InfoRoundedIcon />
                </ListItemIcon>
                <ListItemText primary={'Help'} />
                </ListItemButton>
            </ListItem>
        </List>
        <Divider />
    </div>
    );
}