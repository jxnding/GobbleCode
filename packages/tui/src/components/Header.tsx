import { Box, Text } from "ink";
import chalk from "chalk";

export function Header() {
  const title = `
 ██████╗  ██████╗ ██████╗ ██████╗ ██╗     ███████╗
██╔════╝ ██╔═══██╗██╔══██╗██╔══██╗██║     ██╔════╝
██║  ███╗██║   ██║██████╔╝██████╔╝██║     █████╗  
██║   ██║██║   ██║██╔══██╗██╔══██╗██║     ██╔══╝  
╚██████╔╝╚██████╔╝██████╔╝██████╔╝███████╗███████╗
 ╚═════╝  ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝
`;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="orange" paddingX={1}>
      <Text color="orange" bold>
        {title}
      </Text>
      <Box justifyContent="center">
        <Text color="gray">
          {chalk.italic("The quirky, flashy AI coding agent")}
        </Text>
      </Box>
    </Box>
  );
}
