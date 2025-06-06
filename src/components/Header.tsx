import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Image,
  Tooltip,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tag,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
  Divider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@chakra-ui/icons';
import { 
  FaWallet, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCoins, 
  FaExchangeAlt,
  FaExternalLinkAlt,
  FaEthereum
} from 'react-icons/fa';
import { useWallet } from '../context/WalletContext';
import { useGold } from '../context/GoldContext';
import { usePrice } from '../context/PriceContext';
import logo from '../assets/logo.svg';
import goldVaultImg from '../assets/gold-vault.svg';

export default function Header() {
  const { isOpen, onToggle } = useDisclosure();
  const { address, balance, connectWallet, disconnectWallet, isConnected, networkName } = useWallet();
  const { vGoldBalance } = useGold();
  const { prices } = usePrice();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const toast = useToast();
  
  // Wallet connection modal
  const { isOpen: isWalletModalOpen, onOpen: openWalletModal, onClose: closeWalletModal } = useDisclosure();
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  const maticPrice = prices['matic-network']?.usd || 0;
  const matic24hChange = prices['matic-network']?.usd_24h_change || 0;
  
  // Extract theme values to avoid conditional hooks
  const bgLight = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'white');
  const borderColorValue = useColorModeValue('gray.200', 'gray.900');

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const handleWalletSelect = async (walletType: string) => {
    setSelectedWallet(walletType);
    setConnecting(true);
    
    try {
      if (window.ethereum) {
        const result = await connectWallet();
        toast({
          title: 'Wallet Connected',
          description: `Successfully connected to ${formatAddress(result)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
        closeWalletModal();
      } else {
        throw new Error('No Ethereum wallet detected');
      }
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Could not connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    } finally {
      setConnecting(false);
      setSelectedWallet(null);
    }
  };

  const handleConnectWalletClick = () => {
    if (window.ethereum) {
      // If there is only one wallet provider, connect directly
      if (window.ethereum.isMetaMask && !window.ethereum.isTrust) {
        handleWalletSelect('metamask');
      } else if (window.ethereum.isTrust && !window.ethereum.isMetaMask) {
        handleWalletSelect('trustwallet');
      } else {
        // If multiple providers exist, show selection modal
        openWalletModal();
      }
    } else {
      toast({
        title: 'No Wallet Detected',
        description: 'Please install MetaMask or Trust Wallet to connect',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-right',
      });
    }
  };

  return (
    <Box>
      <Flex
        bg={scrolled ? bgLight : 'transparent'}
        color={textColor}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={scrolled ? '1px' : '0px'}
        borderStyle={'solid'}
        borderColor={borderColorValue}
        align={'center'}
        position="sticky"
        top="0"
        zIndex="1000"
        transition="all 0.3s ease-in-out"
        className={scrolled ? 'shimmer-box' : ''}
        boxShadow={scrolled ? 'md' : 'none'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <RouterLink to="/">
            <HStack spacing={2} className="floating">
              <Image src={logo} alt="GoldChain Logo" height="40px" />
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                fontWeight="bold"
                fontSize="xl"
                className="gold-text"
              >
                GoldChain
              </Text>
            </HStack>
          </RouterLink>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav currentPath={location.pathname} />
          </Flex>
        </Flex>

        {/* MATIC Price Ticker */}
        <Box display={{ base: 'none', md: 'block' }} mr={4}>
          <Tooltip label="MATIC Price">
            <Tag 
              size="md" 
              colorScheme={matic24hChange >= 0 ? 'green' : 'red'} 
              borderRadius="full" 
              variant="solid" 
              className="glow"
            >
              <HStack spacing={1}>
                <Text fontSize="xs">MATIC:</Text>
                <Text fontWeight="bold">${maticPrice.toFixed(2)}</Text>
                <Box>
                  <Icon 
                    as={matic24hChange >= 0 ? ArrowUpIcon : ArrowDownIcon} 
                    boxSize={3} 
                  />
                  <Text fontSize="xs" as="span">
                    {Math.abs(matic24hChange).toFixed(2)}%
                  </Text>
                </Box>
              </HStack>
            </Tag>
          </Tooltip>
        </Box>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {isConnected && address ? (
            <>
              <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
                <Tooltip label="vGold Balance">
                  <Tag colorScheme="yellow" borderRadius="full" px={3} py={2} className="gold-bar-shine">
                    <HStack>
                      <Icon as={FaCoins} color="gold.500" />
                      <Text>{vGoldBalance.toFixed(2)} vGOLD</Text>
                    </HStack>
                  </Tag>
                </Tooltip>
                <Tooltip label="MATIC Balance">
                  <Tag colorScheme="purple" borderRadius="full" px={3} py={2}>
                    <HStack>
                      <Icon as={FaEthereum} color="purple.500" />
                      <Text>{parseFloat(balance).toFixed(4)} MATIC</Text>
                    </HStack>
                  </Tag>
                </Tooltip>
              </HStack>
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    bg="gold.500"
                    icon={<FaUserCircle fontSize="1.5rem" />}
                    className="glow"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/dashboard">
                    Dashboard
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/portfolio">
                    Portfolio
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/transactions">
                    Transactions
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FaWallet />}>
                    {formatAddress(address)}
                    <Badge ml={2} colorScheme="green">
                      Connected
                    </Badge>
                  </MenuItem>
                  <MenuItem icon={<FaExchangeAlt />}>
                    {networkName}
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FaSignOutAlt />} onClick={disconnectWallet}>
                    Disconnect Wallet
                  </MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <Button
              display={{ base: 'none', md: 'inline-flex' }}
              fontSize={'sm'}
              fontWeight={600}
              color={'white'}
              bg={'gold.500'}
              onClick={handleConnectWalletClick}
              leftIcon={<FaWallet />}
              _hover={{
                bg: 'gold.400',
              }}
              className="connect-button"
            >
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav currentPath={location.pathname} />
      </Collapse>
      
      {/* Wallet Selection Modal */}
      <Modal isOpen={isWalletModalOpen} onClose={closeWalletModal} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" className="gold-wave">
          <ModalHeader>Connect Your Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                onClick={() => handleWalletSelect('metamask')}
                className="card-hover"
                bg="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
              >
                <HStack>
                  <Image 
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                    boxSize="50px" 
                    alt="MetaMask" 
                  />
                  <Box>
                    <Text fontWeight="bold">MetaMask</Text>
                    <Text fontSize="sm">The most popular Ethereum wallet</Text>
                  </Box>
                </HStack>
                {connecting && selectedWallet === 'metamask' && (
                  <Flex
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(255, 255, 255, 0.8)"
                    justify="center"
                    align="center"
                  >
                    <Text>Connecting...</Text>
                  </Flex>
                )}
              </Box>
              
              <Box 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                onClick={() => handleWalletSelect('trustwallet')}
                className="card-hover"
                bg="white"
                cursor="pointer"
                position="relative"
                overflow="hidden"
              >
                <HStack>
                  <Image 
                    src="https://trustwallet.com/assets/images/favicon.png" 
                    boxSize="50px" 
                    alt="Trust Wallet" 
                  />
                  <Box>
                    <Text fontWeight="bold">Trust Wallet</Text>
                    <Text fontSize="sm">Secure multi-chain crypto wallet</Text>
                  </Box>
                </HStack>
                {connecting && selectedWallet === 'trustwallet' && (
                  <Flex
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(255, 255, 255, 0.8)"
                    justify="center"
                    align="center"
                  >
                    <Text>Connecting...</Text>
                  </Flex>
                )}
              </Box>
              
              <Divider />
              
              <HStack justify="center">
                <Image 
                  src={goldVaultImg} 
                  height="100px" 
                  alt="Gold Vault" 
                  className="gold-stack" 
                />
              </HStack>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                By connecting your wallet, you agree to the Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
  icon?: React.ReactElement;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Buy vGold',
    href: '/buy',
  },
  {
    label: 'Earn',
    children: [
      {
        label: 'Lend vGold',
        subLabel: 'Earn interest on your vGold',
        href: '/lend',
      },
      {
        label: 'Staking',
        subLabel: 'Coming soon',
        href: '#',
      },
    ],
  },
  {
    label: 'Borrow',
    href: '/borrow',
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
  },
];

const DesktopNav = ({ currentPath }: { currentPath: string }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={
                  currentPath === navItem.href ? 'bold' : 'medium'
                }
                color={
                  currentPath === navItem.href
                    ? 'gold.500'
                    : linkColor
                }
                position="relative"
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
                _after={
                  currentPath === navItem.href
                    ? {
                        content: '""',
                        position: 'absolute',
                        width: '100%',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        background: 'gold.500',
                      }
                    : {}
                }
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
                className="slide-in-down"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Link
      as={RouterLink}
      to={href ?? '#'}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('gold.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'gold.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'gold.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ currentPath }: { currentPath: string }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
      className="slide-in-down"
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} isActive={currentPath === navItem.href} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href, isActive }: NavItem & { isActive?: boolean }) => {
  const { isOpen, onToggle } = useDisclosure();
  const bgColor = useColorModeValue('gray.100', 'gray.900');

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={Link}
        href={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
        bg={isActive ? bgColor : 'transparent'}
        fontWeight={isActive ? 'bold' : 'normal'}
        color={isActive ? 'gold.500' : 'inherit'}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link key={child.label} py={2} href={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
}; 